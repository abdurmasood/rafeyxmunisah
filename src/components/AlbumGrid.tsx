"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { AlbumHeader } from "./AlbumHeader";
import { PhotoViewer } from "./PhotoViewer";

interface AlbumGridProps {
  albumId: string;
}

export function AlbumGrid({ albumId }: AlbumGridProps) {
  const typedAlbumId = albumId as Id<"albums">;
  const photos = useQuery(api.photos.listByAlbum, { album_id: typedAlbumId });
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const createPhoto = useMutation(api.photos.create);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Get image dimensions
        const dimensions = await getImageDimensions(file);

        // Get upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload file
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        const { storageId } = await response.json();

        // Create photo record
        await createPhoto({
          album_id: typedAlbumId,
          storage_id: storageId,
          width: dimensions.width,
          height: dimensions.height,
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTapOutside = () => {
    setSelectedPhotoIndex(null);
  };

  if (photos === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--muted-foreground)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AlbumHeader albumId={typedAlbumId} />

      {/* Grid area with top padding for header */}
      <div className="pt-20 p-3">
        {photos.length === 0 ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-20 h-20 rounded-full bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] hover:text-[var(--accent-foreground)] transition-all duration-300 ease-out flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-8 h-8" strokeWidth={1.5} />
            </button>
            <p
              className="mt-6 text-[var(--muted-foreground)] text-sm tracking-wide"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Add your first photos
            </p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {photos.map((photo, index) => (
              <button
                key={photo._id}
                onClick={() => setSelectedPhotoIndex(index)}
                className="block w-full break-inside-avoid group"
              >
                <img
                  src={photo.url || ""}
                  alt={photo.caption || "Photo"}
                  className="w-full rounded transition-all duration-300 ease-out group-hover:opacity-90 group-hover:scale-[1.02]"
                  style={{
                    aspectRatio: `${photo.width} / ${photo.height}`,
                  }}
                />
              </button>
            ))}

            {/* Add photo tile */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full aspect-square bg-[var(--muted)] hover:bg-[var(--accent)]/20 transition-all duration-300 ease-out flex items-center justify-center rounded break-inside-avoid disabled:opacity-50"
            >
              <Plus
                className="w-8 h-8 text-[var(--muted-foreground)]"
                strokeWidth={1.5}
              />
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo viewer overlay */}
      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <PhotoViewer
          photos={photos}
          initialIndex={selectedPhotoIndex}
          onClose={handleTapOutside}
        />
      )}
    </div>
  );
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
