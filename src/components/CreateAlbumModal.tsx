"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CreateAlbumModalProps {
  onClose: () => void;
}

export function CreateAlbumModal({ onClose }: CreateAlbumModalProps) {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const createAlbum = useMutation(api.albums.create);
  const router = useRouter();

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const albumId = await createAlbum({ name: name.trim() });
      router.push(`/album/${albumId}`);
    } catch (error) {
      console.error("Failed to create album:", error);
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-200 ${
        isVisible ? "bg-black/60" : "bg-black/0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[var(--muted)] rounded-lg p-10 w-full max-w-md transition-all duration-200 ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this memory..."
              autoFocus
              className="w-full bg-transparent border-b-2 border-[var(--border)] pb-3 text-2xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200"
              style={{ fontFamily: "var(--font-playfair)" }}
            />
          </div>
          <div className="flex justify-end gap-6">
            <button
              type="button"
              onClick={handleClose}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200 text-sm tracking-wide"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isCreating}
              className="text-[var(--accent)] hover:text-[var(--foreground)] transition-colors duration-200 text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
