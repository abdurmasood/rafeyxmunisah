"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateAlbumModal } from "./CreateAlbumModal";
import Link from "next/link";

export function Timeline() {
  const albums = useQuery(api.albums.list);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (albums === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="text-[var(--muted-foreground)] text-sm tracking-widest uppercase animate-pulse"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Album list */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        {albums.length === 0 ? (
          <p
            className="text-[var(--muted-foreground)] text-xl tracking-wide"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Your first memory awaits
          </p>
        ) : (
          <nav className="w-full max-w-lg space-y-12">
            {albums.map((album, index) => (
              <Link
                key={album._id}
                href={`/album/${album._id}`}
                className="block text-center group"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <span
                  className="text-2xl md:text-3xl text-[var(--foreground)] transition-all duration-300 ease-out group-hover:text-[var(--accent)] group-hover:tracking-wider"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {album.name}
                </span>
              </Link>
            ))}
          </nav>
        )}
      </main>

      {/* Floating add button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] hover:text-[var(--accent-foreground)] transition-all duration-300 ease-out flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        aria-label="Create new album"
      >
        <Plus className="w-6 h-6" strokeWidth={1.5} />
      </button>

      {/* Create album modal */}
      {showCreateModal && (
        <CreateAlbumModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
