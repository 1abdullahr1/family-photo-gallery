export interface PhotoItem {
  id: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  aspectRatio: number;
  src: string;
  thumbnailSrc: string;
  fullSrc: string;
  caption?: string;
  alt?: string;
  createdAt: string;
  bytes: number;
}

export interface CloudinaryResource {
  asset_id?: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  folder?: string;
  url?: string;
  secure_url?: string;
  context?: {
    custom?: {
      caption?: string;
      alt?: string;
      description?: string;
      [key: string]: string | undefined;
    };
  };
  tags?: string[];
}

export interface CloudinarySearchResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
  total_count?: number;
}

export interface SessionPayload {
  authenticated: boolean;
  createdAt: number;
  expiresAt: number;
}

export interface RateLimitResult {
  isBlocked: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
}
