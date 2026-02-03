"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface AlbumHeaderProps {
  albumId: Id<"albums">;
}

export function AlbumHeader({ albumId }: AlbumHeaderProps) {
  const album = useQuery(api.albums.get, { id: albumId });
  const updateAlbum = useMutation(api.albums.update);
  const deleteAlbum = useMutation(api.albums.remove);
  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!album) return null;

  const handleExpand = () => {
    if (!isExpanded) {
      setName(album.name);
      setDate(album.date || "");
      setLocation(album.location || "");
    }
    setIsExpanded(!isExpanded);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const handleSave = async () => {
    await updateAlbum({
      id: albumId,
      name: name || undefined,
      date: date || undefined,
      location: location || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteAlbum({ id: albumId });
    router.push("/");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-30">
      {/* Back button */}
      <Link
        href="/"
        className="absolute left-4 top-4 p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200 z-40"
        aria-label="Back to albums"
      >
        <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
      </Link>

      {/* Main header bar */}
      <button
        onClick={handleExpand}
        className="w-full py-5 px-6 text-center bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)]"
      >
        <h1
          className="text-lg text-[var(--foreground)] tracking-wide"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {album.name}
        </h1>
      </button>

      {/* Expanded details panel */}
      <div
        className={`bg-[var(--muted)] border-b border-[var(--border)] overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 space-y-5">
          {isEditing ? (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Album name"
                className="w-full bg-transparent border-b border-[var(--border)] pb-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                style={{ fontFamily: "var(--font-playfair)" }}
              />
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Date (optional)"
                className="w-full bg-transparent border-b border-[var(--border)] pb-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors text-sm"
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (optional)"
                className="w-full bg-transparent border-b border-[var(--border)] pb-2 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors text-sm"
              />
              <div className="flex gap-6 pt-2">
                <button
                  onClick={handleSave}
                  className="text-[var(--accent)] hover:text-[var(--foreground)] transition-colors text-sm tracking-wide"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm tracking-wide"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                {album.date && (
                  <p className="text-[var(--muted-foreground)] text-sm">{album.date}</p>
                )}
                {album.location && (
                  <p className="text-[var(--muted-foreground)] text-sm">{album.location}</p>
                )}
                {!album.date && !album.location && (
                  <p className="text-[var(--muted-foreground)] text-sm italic">No details added yet</p>
                )}
              </div>
              <div className="flex gap-6 pt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[var(--accent)] hover:text-[var(--foreground)] transition-colors text-sm tracking-wide"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400 hover:text-red-300 transition-colors text-sm tracking-wide"
                >
                  Delete album
                </button>
              </div>
            </>
          )}

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--foreground)] mb-4">
                Delete this album and all its photos?
              </p>
              <div className="flex gap-6">
                <button
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 transition-colors text-sm tracking-wide"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm tracking-wide"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
