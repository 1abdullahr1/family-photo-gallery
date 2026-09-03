import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { getCloudinaryConfig, generateSignedCloudinaryUrl } from "@/lib/cloudinary";

export const runtime = "edge";

interface RouteParams {
  params: Promise<{
    publicId: string[];
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Enforce authenticated session
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const session = await verifySessionToken(sessionCookie?.value);

    if (!session || !session.authenticated) {
      return new NextResponse("Unauthorized. Active session required to view photograph.", {
        status: 401,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const { publicId: publicIdParts } = await params;
    if (!publicIdParts || publicIdParts.length === 0) {
      return new NextResponse("Invalid photo identifier.", { status: 400 });
    }

    const publicId = publicIdParts.map(decodeURIComponent).join("/");
    const { cloudName, apiKey, apiSecret, deliveryType } = getCloudinaryConfig();

    if (!cloudName) {
      return new NextResponse("Cloudinary configuration missing.", { status: 503 });
    }

    // 2. Determine requested transformations
    const url = new URL(request.url);
    const width = url.searchParams.get("w");
    const quality = url.searchParams.get("q") || "auto";

    let transformation = "f_auto,q_" + quality;
    if (width) {
      transformation = `c_limit,w_${width},` + transformation;
    }

    // 3. Construct source URL
    let fetchUrl: string;

    if (deliveryType === "authenticated" || deliveryType === "private") {
      // Use signed Cloudinary URL with secret signature for private/authenticated asset
      fetchUrl = await generateSignedCloudinaryUrl(publicId, transformation);
    } else {
      // Standard upload delivery
      fetchUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
    }

    // 4. Fetch the image from Cloudinary using server credentials
    const credentials = `${apiKey}:${apiSecret}`;
    const authHeader = `Basic ${typeof btoa !== "undefined" ? btoa(credentials) : Buffer.from(credentials).toString("base64")}`;

    const cloudinaryRes = await fetch(fetchUrl, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!cloudinaryRes.ok) {
      console.error(`Failed to fetch photo from Cloudinary: ${cloudinaryRes.status} for ${publicId}`);
      return new NextResponse("Photograph not found or access denied.", {
        status: cloudinaryRes.status,
      });
    }

    const contentType = cloudinaryRes.headers.get("content-type") || "image/jpeg";
    const contentLength = cloudinaryRes.headers.get("content-length");

    // 5. Stream image with private caching headers
    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    };

    if (contentLength) {
      responseHeaders["Content-Length"] = contentLength;
    }

    return new NextResponse(cloudinaryRes.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Photo streaming error:", error);
    return new NextResponse("Internal server error while streaming photograph.", {
      status: 500,
    });
  }
}
