"use client";

import { useState } from "react";
import { PhotoItem } from "@/lib/types";
import PhotoCard from "./PhotoCard";
import PhotoLightbox from "./PhotoLightbox";

interface PhotoGridProps {
  photos: PhotoItem[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div>
      {/* Responsive Grid with Generous Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={index}
            onSelect={(idx) => setSelectedIndex(idx)}
          />
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedIndex !== null && (
        <PhotoLightbox
          photos={photos}
          currentIndex={selectedIndex}
          isOpen={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          onNavigate={(idx) => setSelectedIndex(idx)}
        />
      )}
    </div>
  );
}
