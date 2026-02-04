"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Photo {
  _id: Id<"photos">;
  url: string | null;
  caption?: string;
  width: number;
  height: number;
}

interface PhotoViewerProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoViewer({ photos, initialIndex, onClose }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showCaption, setShowCaption] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const updateCaption = useMutation(api.photos.updateCaption);
  const deletePhoto = useMutation(api.photos.remove);

  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return;

      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setShowCaption(false);
        setIsEditing(false);
      } else if (e.key === "ArrowRight" && currentIndex < photos.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowCaption(false);
        setIsEditing(false);
      } else if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, photos.length, isEditing]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left" && currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowCaption(false);
      setIsEditing(false);
    } else if (direction === "right" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowCaption(false);
      setIsEditing(false);
    }
  };

  const handlePhotoTap = () => {
    if (!isEditing) {
      setShowCaption(!showCaption);
    }
  };

  const handleStartEdit = () => {
    setEditedCaption(currentPhoto.caption || "");
    setIsEditing(true);
  };

  const handleSaveCaption = async () => {
    await updateCaption({
      id: currentPhoto._id,
      caption: editedCaption || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deletePhoto({ id: currentPhoto._id });
    if (photos.length <= 1) {
      handleClose();
    } else if (currentIndex >= photos.length - 1) {
      setCurrentIndex(currentIndex - 1);
    }
    setShowDeleteConfirm(false);
  };

  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      handleSwipe(diff > 0 ? "left" : "right");
    }
    setTouchStart(null);
  };

  return (
    <div
      className={`fixed inset-0 bg-black z-50 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* Photo */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          handlePhotoTap();
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentPhoto.url || ""}
          alt={currentPhoto.caption || "Photo"}
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />
      </div>

      {/* Caption overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 ${
          showCaption
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pt-20">
          {isEditing ? (
            <div className="space-y-5">
              <input
                type="text"
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                placeholder="Add a caption..."
                autoFocus
                className="w-full bg-transparent border-b border-white/30 pb-2 text-[#f5f0e8] placeholder:text-white/40 focus:outline-none focus:border-[#e71d36] transition-colors"
                style={{ fontFamily: "var(--font-playfair)" }}
              />
              <div className="flex gap-6 items-center">
                <button
                  onClick={handleSaveCaption}
                  className="text-[#e71d36] hover:text-white transition-colors text-sm tracking-wide"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-white/50 hover:text-white transition-colors text-sm tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400/80 hover:text-red-300 transition-colors text-sm tracking-wide ml-auto"
                >
                  Delete photo
                </button>
              </div>

              {showDeleteConfirm && (
                <div className="pt-5 border-t border-white/10">
                  <p className="text-white/70 text-sm mb-4">Delete this photo?</p>
                  <div className="flex gap-6">
                    <button
                      onClick={handleDelete}
                      className="text-red-400 hover:text-red-300 transition-colors text-sm tracking-wide"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-white/50 hover:text-white transition-colors text-sm tracking-wide"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {currentPhoto.caption ? (
                <p
                  className="text-[#f5f0e8] text-lg cursor-pointer hover:text-[#e71d36] transition-colors"
                  onClick={handleStartEdit}
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {currentPhoto.caption}
                </p>
              ) : (
                <button
                  onClick={handleStartEdit}
                  className="text-white/40 hover:text-white/70 transition-colors text-sm tracking-wide"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Add a caption...
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photo counter */}
      {photos.length > 1 && (
        <div
          className={`absolute top-6 left-1/2 -translate-x-1/2 text-white/40 text-sm tracking-widest transition-opacity duration-300 ${
            showCaption ? "opacity-0" : "opacity-100"
          }`}
        >
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}
