import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { fetchPhotosFromCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // 1. Verify session cookie
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    const session = await verifySessionToken(sessionCookie?.value);

    if (!session || !session.authenticated) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to view the family album." },
        { status: 401 }
      );
    }

    // 2. Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error: "Cloudinary credentials not configured.",
          isConfigured: false,
          photos: [],
        },
        { status: 503 }
      );
    }

    // 3. Retrieve dynamic photo list from Cloudinary
    const photos = await fetchPhotosFromCloudinary();

    return NextResponse.json({
      photos,
      count: photos.length,
      isConfigured: true,
    });
  } catch (error: any) {
    console.error("Photos API error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to retrieve photographs from album.",
        photos: [],
      },
      { status: 500 }
    );
  }
}
