"use client";

import { useState, useRef } from "react";
import { ImageIcon, Upload, Loader2, Link, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ImageUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string, alt?: string) => void;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function ImageUploadDialog({
  open,
  onClose,
  onInsert,
}: ImageUploadDialogProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cloudinary not configured");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "solace/notes");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onInsert(data.secure_url, file.name);
      handleClose();
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlInsert = () => {
    if (!imageUrl.trim()) return;
    onInsert(imageUrl.trim());
    handleClose();
  };

  const handleClose = () => {
    setPreview(null);
    setImageUrl("");
    setTab("upload");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-card border border-border rounded-lg w-full max-w-md mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium">Insert Image</h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("upload")}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              tab === "upload"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground"
            }`}
          >
            <Upload className="h-3.5 w-3.5 inline mr-1.5" />
            Upload
          </button>
          <button
            onClick={() => setTab("url")}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              tab === "url"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground"
            }`}
          >
            <Link className="h-3.5 w-3.5 inline mr-1.5" />
            From URL
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {tab === "upload" ? (
            <div>
              {preview ? (
                <div className="relative mb-3">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-md"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-lg py-10 flex flex-col items-center gap-2 hover:border-muted-foreground transition-colors"
                >
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Click to select an image
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    PNG, JPG, GIF, WebP up to 10MB
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlInsert()}
                className="h-8 text-sm"
                autoFocus
              />
              <Button
                onClick={handleUrlInsert}
                disabled={!imageUrl.trim()}
                size="sm"
                className="w-full h-8 text-xs"
              >
                Insert Image
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
