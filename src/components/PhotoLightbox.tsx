"use client";

import { useEffect, useState, useCallback, useRef, TouchEvent } from "react";
import { PhotoItem } from "@/lib/types";

interface PhotoLightboxProps {
  photos: PhotoItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const currentPhoto = photos[currentIndex];
  const totalPhotos = photos.length;

  const handleNext = useCallback(() => {
    if (currentIndex < totalPhotos - 1) {
      setIsImageLoaded(false);
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, totalPhotos, onNavigate]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsImageLoaded(false);
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Reset image loaded state when active index changes
  useEffect(() => {
    setIsImageLoaded(false);
  }, [currentIndex]);

  // Mobile swipe gestures
  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.targetTouches[0].clientX;
  }

  function handleTouchMove(e: TouchEvent) {
    touchEndX.current = e.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (diff > minSwipeDistance) {
      // Swiped left -> next photo
      handleNext();
    } else if (diff < -minSwipeDistance) {
      // Swiped right -> prev photo
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  if (!isOpen || !currentPhoto) return null;

  const formattedDate = currentPhoto.createdAt
    ? new Date(currentPhoto.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo Viewer"
      className="fixed inset-0 z-50 flex flex-col bg-[#141312]/95 backdrop-blur-[2px] select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar: Counter, Title, Close Button */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-[#D8D4CC] border-b border-white/10 z-10">
        <div className="text-xs font-sans tracking-wider text-[#A8A49C]">
          <span>{currentIndex + 1}</span>
          <span className="mx-1">/</span>
          <span>{totalPhotos}</span>
        </div>

        {currentPhoto.caption && (
          <div className="font-serif text-sm text-[#EDEAE3] truncate max-w-md px-4 hidden sm:block">
            {currentPhoto.caption}
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Subtle Download Link */}
          <a
            href={currentPhoto.fullSrc}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[#A8A49C] hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Download original photograph"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </a>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-[#A8A49C] hover:text-white hover:bg-white/10 rounded transition-colors"
            aria-label="Close photo viewer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Photographic Area */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
        {/* Backdrop click area */}
        <div
          className="absolute inset-0"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Previous Button */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-6 z-20 p-2.5 sm:p-3 text-[#D8D4CC] hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors focus:outline-none"
            aria-label="Previous photo"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* The Photograph */}
        <div className="relative z-10 max-w-full max-h-[80vh] flex items-center justify-center">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center min-w-[200px] min-h-[200px]">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            </div>
          )}

          <img
            key={currentPhoto.id}
            src={currentPhoto.fullSrc}
            alt={currentPhoto.alt || currentPhoto.caption || `Family photograph ${currentIndex + 1}`}
            onLoad={() => setIsImageLoaded(true)}
            className={`max-w-full max-h-[78vh] object-contain rounded-sm shadow-2xl transition-opacity duration-200 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Next Button */}
        {currentIndex < totalPhotos - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-6 z-20 p-2.5 sm:p-3 text-[#D8D4CC] hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors focus:outline-none"
            aria-label="Next photo"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Footer Info: Caption & Date */}
      <div className="px-4 sm:px-6 py-3 border-t border-white/10 text-center z-10">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-xs">
          {currentPhoto.caption && (
            <p className="font-serif text-[#ECE9E2] text-sm sm:hidden font-normal">
              {currentPhoto.caption}
            </p>
          )}
          {formattedDate && (
            <span className="text-[#969186] font-sans">
              Taken on {formattedDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
