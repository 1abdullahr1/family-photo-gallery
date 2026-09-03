import { CloudinaryResource, CloudinarySearchResponse, PhotoItem } from "./types";

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
  deliveryType: "upload" | "authenticated" | "private";
}

export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  const folder = process.env.CLOUDINARY_FOLDER || "";
  const deliveryType = (process.env.CLOUDINARY_DELIVERY_TYPE as any) || "upload";

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder: folder.trim(),
    deliveryType: deliveryType === "authenticated" || deliveryType === "private" ? deliveryType : "upload",
  };
}

/**
 * Validates whether the required Cloudinary credentials are configured in the environment.
 */
export function isCloudinaryConfigured(): boolean {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  return Boolean(cloudName && apiKey && apiSecret);
}

/**
 * Creates the Basic Auth header required for Cloudinary Admin and Search APIs.
 */
function getAuthHeader(apiKey: string, apiSecret: string): string {
  const credentials = `${apiKey}:${apiSecret}`;
  if (typeof btoa !== "undefined") {
    return `Basic ${btoa(credentials)}`;
  }
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

/**
 * Generates an SHA-1 hex hash using Web Crypto API.
 */
async function sha1Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data as unknown as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates a signed Cloudinary delivery URL for private or authenticated assets.
 */
export async function generateSignedCloudinaryUrl(
  publicId: string,
  transformations: string = "f_auto,q_auto",
  format?: string
): Promise<string> {
  const { cloudName, apiSecret, deliveryType } = getCloudinaryConfig();
  if (!cloudName) return "";

  const resourcePath = format ? `${publicId}.${format}` : publicId;
  const toSign = `${transformations}/${resourcePath}${apiSecret}`;
  const fullHash = await sha1Hex(toSign);
  const signature = `s--${fullHash.substring(0, 8)}--`;

  return `https://res.cloudinary.com/${cloudName}/image/${deliveryType}/${signature}/${transformations}/${resourcePath}`;
}

/**
 * Builds our internal secure authenticated proxy URL for delivering photos.
 * Requests to this route require an active session cookie, preventing unauthorized public access.
 */
export function getSecureProxyUrl(publicId: string, options: { width?: number; quality?: number } = {}): string {
  const params = new URLSearchParams();
  if (options.width) params.set("w", options.width.toString());
  if (options.quality) params.set("q", options.quality.toString());

  const queryString = params.toString();
  const encodedId = encodeURIComponent(publicId);
  return `/api/photos/${encodedId}${queryString ? `?${queryString}` : ""}`;
}

/**
 * Fetches dynamic list of photographs from Cloudinary using Cloudflare-compatible Web Fetch.
 */
export async function fetchPhotosFromCloudinary(): Promise<PhotoItem[]> {
  const { cloudName, apiKey, apiSecret, folder, deliveryType } = getCloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables."
    );
  }

  const authHeader = getAuthHeader(apiKey, apiSecret);

  // Construct search expression
  let expression = "resource_type:image";
  if (folder) {
    expression += ` AND folder="${folder}*"`;
  }
  if (deliveryType === "authenticated" || deliveryType === "private") {
    expression += ` AND type:${deliveryType}`;
  }

  try {
    const searchUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;
    const searchResponse = await fetch(searchUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expression,
        sort_by: [{ created_at: "desc" }],
        max_results: 100,
        with_field: ["context", "tags", "metadata"],
      }),
      // Revalidate cache every 60 seconds
      next: { revalidate: 60 },
    });

    if (searchResponse.ok) {
      const data: CloudinarySearchResponse = await searchResponse.json();
      return (data.resources || []).map((res) => mapResourceToPhotoItem(res));
    }

    // If Search API returns 400/404 (e.g., search indexing pending), fallback to standard resources endpoint
    console.warn(`Cloudinary Search API returned ${searchResponse.status}, falling back to Resources API...`);
    const fallbackUrl = folder
      ? `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/${deliveryType}?prefix=${encodeURIComponent(folder)}&max_results=100&context=true&tags=true`
      : `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/${deliveryType}?max_results=100&context=true&tags=true`;

    const fallbackResponse = await fetch(fallbackUrl, {
      headers: {
        Authorization: authHeader,
      },
      next: { revalidate: 60 },
    });

    if (!fallbackResponse.ok) {
      const errorText = await fallbackResponse.text();
      throw new Error(`Cloudinary API error: ${fallbackResponse.status} - ${errorText}`);
    }

    const fallbackData: CloudinarySearchResponse = await fallbackResponse.json();
    return (fallbackData.resources || []).map((res) => mapResourceToPhotoItem(res));
  } catch (error) {
    console.error("Failed to fetch photographs from Cloudinary:", error);
    throw error;
  }
}

/**
 * Transforms a raw Cloudinary asset into a clean, typed PhotoItem with secure internal URLs.
 */
function mapResourceToPhotoItem(resource: CloudinaryResource): PhotoItem {
  const publicId = resource.public_id;
  const width = resource.width || 1200;
  const height = resource.height || 800;
  const aspectRatio = Number((width / height).toFixed(4));

  // Extract caption and metadata
  const caption =
    resource.context?.custom?.caption ||
    resource.context?.custom?.description ||
    resource.context?.custom?.title ||
    "";

  const alt = resource.context?.custom?.alt || caption || "Family photograph";

  // Use authenticated streaming proxy URLs to enforce private session access
  const thumbnailSrc = getSecureProxyUrl(publicId, { width: 800, quality: 80 });
  const fullSrc = getSecureProxyUrl(publicId, { width: 2200, quality: 88 });
  const standardSrc = getSecureProxyUrl(publicId, { width: 1400, quality: 85 });

  return {
    id: publicId,
    publicId,
    width,
    height,
    format: resource.format || "jpg",
    aspectRatio,
    src: standardSrc,
    thumbnailSrc,
    fullSrc,
    caption: caption.trim() ? caption.trim() : undefined,
    alt: alt.trim() ? alt.trim() : undefined,
    createdAt: resource.created_at,
    bytes: resource.bytes || 0,
  };
}
