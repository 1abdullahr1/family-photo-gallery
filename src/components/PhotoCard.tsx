"use client";

import { useState } from "react";
import { PhotoItem } from "@/lib/types";

interface PhotoCardProps {
  photo: PhotoItem;
  index: number;
  onSelect: (index: number) => void;
}

export default function PhotoCard({ photo, index, onSelect }: PhotoCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Format date nicely if available
  const formattedDate = photo.createdAt
    ? new Date(photo.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(index);
        }
      }}
      className="group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-album-ink focus-visible:ring-offset-2 rounded"
      aria-label={`View photograph: ${photo.caption || photo.alt || `Photo ${index + 1}`}`}
    >
      <div className="bg-album-surface border border-album-border rounded p-2.5 sm:p-3 shadow-photo transition-all duration-200 group-hover:shadow-photo-hover group-hover:border-[#DDD8CE]">
        {/* Photo Container */}
        <div
          className="relative w-full overflow-hidden bg-album-muted rounded-sm"
          style={{
            paddingBottom: `${Math.min(133, Math.max(60, (photo.height / photo.width) * 100))}%`,
          }}
        >
          {/* Skeleton Placeholder while loading */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-album-muted animate-pulse" />
          )}

          <img
            src={photo.thumbnailSrc}
            alt={photo.alt || photo.caption || `Family photograph ${index + 1}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Minimalist Understated Caption */}
        {(photo.caption || formattedDate) && (
          <div className="mt-2.5 pt-1.5 flex items-baseline justify-between gap-2 text-left">
            {photo.caption ? (
              <p className="font-serif text-xs text-album-ink truncate font-normal">
                {photo.caption}
              </p>
            ) : (
              <span />
            )}
            {formattedDate && (
              <span className="text-[11px] text-album-ink-faint font-sans whitespace-nowrap flex-shrink-0">
                {formattedDate}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
