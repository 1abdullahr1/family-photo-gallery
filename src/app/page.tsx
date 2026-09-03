import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { fetchPhotosFromCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import GalleryHeader from "@/components/GalleryHeader";
import PhotoGrid from "@/components/PhotoGrid";
import EmptyState from "@/components/EmptyState";
import { PhotoItem } from "@/lib/types";

export const runtime = "edge";
// Revalidate every 60 seconds
export const revalidate = 60;

export default async function GalleryPage() {
  // 1. Verify authentication
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const session = await verifySessionToken(sessionCookie?.value);

  if (!session || !session.authenticated) {
    redirect("/login");
  }

  const title = process.env.NEXT_PUBLIC_GALLERY_TITLE || "The Family Album";
  const subtitle =
    process.env.NEXT_PUBLIC_GALLERY_SUBTITLE ||
    "Private archive of our moments and memories";
  const folder = process.env.CLOUDINARY_FOLDER || "";

  // 2. Check Cloudinary configuration
  const isConfigured = isCloudinaryConfigured();
  let photos: PhotoItem[] = [];
  let errorMessage: string | null = null;

  if (isConfigured) {
    try {
      photos = await fetchPhotosFromCloudinary();
    } catch (err: any) {
      console.error("Gallery page photo load error:", err);
      errorMessage =
        err?.message || "Failed to load photographs from the Cloudinary archive.";
    }
  }

  return (
    <div className="min-h-screen bg-album-bg flex flex-col">
      <GalleryHeader
        title={title}
        subtitle={subtitle}
        photoCount={photos.length}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {!isConfigured ? (
          <div className="max-w-xl mx-auto my-12 p-8 bg-album-surface border border-album-border rounded-lg shadow-card text-center">
            <h2 className="font-serif text-xl sm:text-2xl text-album-ink font-normal mb-3">
              Cloudinary Setup Required
            </h2>
            <p className="text-xs sm:text-sm text-album-ink-muted leading-relaxed mb-6 font-sans">
              The gallery requires your Cloudinary credentials to load photos. Please set the following environment variables in your deployment or <code className="bg-album-muted px-1.5 py-0.5 rounded text-album-ink font-mono text-xs">.env.local</code>:
            </p>
            <div className="p-4 bg-album-bg border border-album-border rounded text-left font-mono text-xs text-album-ink space-y-1">
              <div>CLOUDINARY_CLOUD_NAME=&quot;...&quot;</div>
              <div>CLOUDINARY_API_KEY=&quot;...&quot;</div>
              <div>CLOUDINARY_API_SECRET=&quot;...&quot;</div>
              <div>CLOUDINARY_FOLDER=&quot;family-album&quot;</div>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="max-w-md mx-auto my-12 p-8 bg-album-surface border border-[#EAC9C0] rounded-lg shadow-card text-center">
            <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-full bg-[#FDF4F1] text-[#9A3A28]">
              <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="font-serif text-lg text-album-ink font-normal mb-2">
              Unable to Load Photographs
            </h2>
            <p className="text-xs text-album-ink-muted leading-relaxed mb-6">
              {errorMessage}
            </p>
            <a
              href="/"
              className="inline-block px-4 py-2 bg-album-button hover:bg-album-button-hover text-white text-xs font-medium rounded transition-colors"
            >
              Try Again
            </a>
          </div>
        ) : photos.length === 0 ? (
          <EmptyState folderName={folder} />
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </main>

      <footer className="border-t border-album-border-light py-6 text-center">
        <p className="text-[11px] text-album-ink-faint font-sans">
          {title} &bull; Private family collection
        </p>
      </footer>
    </div>
  );
}
