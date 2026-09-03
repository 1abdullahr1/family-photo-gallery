"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GalleryHeaderProps {
  title?: string;
  subtitle?: string;
  photoCount: number;
}

export default function GalleryHeader({
  title = "The Family Album",
  subtitle = "Private archive of our moments and memories",
  photoCount,
}: GalleryHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-album-border bg-album-bg/80 backdrop-blur-none sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl text-album-ink tracking-tight font-normal">
                {title}
              </h1>
              {photoCount > 0 && (
                <span className="inline-block text-xs font-sans text-album-ink-faint border border-album-border px-2 py-0.5 rounded-full">
                  {photoCount} {photoCount === 1 ? "photo" : "photos"}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-album-ink-muted font-sans max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-album-ink-muted hover:text-album-ink bg-album-surface hover:bg-album-muted border border-album-border rounded transition-colors duration-150 disabled:opacity-50"
              title="Lock album and end current session"
            >
              <svg
                className="w-3.5 h-3.5 text-album-ink-muted"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <span>{isLoggingOut ? "Locking..." : "Lock Album"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
