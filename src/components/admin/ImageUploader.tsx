import React, { useState, useRef } from "react";
import { UploadService } from "../../lib/api";

interface UploadedImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError("");

    const validFiles = Array.from(files).filter((f) => {
      if (!f.type.startsWith("image/")) {
        setUploadError("Only image files are allowed");
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        setUploadError("Each image must be under 5MB");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;
    setIsUploading(true);

    try {
      const uploaded = await Promise.all(
        validFiles.map((f) => UploadService.uploadImage(f))
      );
      const newImages: UploadedImage[] = uploaded.map((u, i) => ({
        id: u.id,
        url: u.url,
        isPrimary: images.length === 0 && i === 0,
      }));
      onChange([...images, ...newImages]);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const setPrimary = (id: string) => {
    onChange(images.map((img) => ({ ...img, isPrimary: img.id === id })));
  };

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={[
          "border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors",
          dragOver
            ? "border-maroon bg-maroon/5"
            : "border-cream-dark hover:border-maroon hover:bg-maroon/5",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          title="Upload product images"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-2 border-maroon border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-light">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl text-maroon/30">↑</span>
            <p className="text-sm text-charcoal font-sans">
              Drag & drop images here or{" "}
              <span className="text-maroon underline">browse</span>
            </p>
            <p className="text-xs text-text-light">
              PNG, JPG, WEBP up to 5MB each
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-red-500">{uploadError}</p>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div>
          <p className="text-xs tracking-widest uppercase text-text-light mb-3 font-sans">
            Uploaded Images — click star to set as primary
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <div
                  className={[
                    "aspect-square rounded-sm overflow-hidden border-2 transition-colors",
                    img.isPrimary ? "border-maroon" : "border-cream-dark",
                  ].join(" ")}
                >
                  <img
                    src={img.url}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Primary badge */}
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 bg-maroon text-white text-[0.55rem] px-1.5 py-0.5 rounded-sm font-sans">
                    Primary
                  </span>
                )}

                {/* Actions */}
                <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!img.isPrimary && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimary(img.id);
                      }}
                      title="Set as primary"
                      className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow text-amber-500 hover:bg-amber-50 transition-colors text-xs"
                    >
                      ★
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(img.id);
                    }}
                    title="Remove image"
                    className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow text-red-500 hover:bg-red-50 transition-colors text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};