"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Loader2,
  ImageIcon,
  Music,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

import AudioSnippetEditor from "@/components/AudioSnippetEditor";

import type { Photo } from "@/types";

interface AudioUploadResult {
  audioUrl: string;
  filename: string;
  size: number;
}

interface UploadDialogProps {
  type: "photo" | "audio";

  onUpload: (
    result: Photo | AudioUploadResult
  ) => void;

  open: boolean;

  onOpenChange: (open: boolean) => void;

  multiple?: boolean;
}

export function UploadDialog({

  type,

  onUpload,

  open,

  onOpenChange,

  multiple = false,

}: UploadDialogProps) {

  const [isUploading, setIsUploading] = useState(false);

  const [dragOver, setDragOver] = useState(false);

  const [previews, setPreviews] = useState<string[]>([]);

  const [selectedAudio, setSelectedAudio] =
    useState<File | null>(null);

  const [showEditor, setShowEditor] =
    useState(false);

  const uploadFile = async (
    file: File
  ): Promise<AudioUploadResult | Photo> => {

    setIsUploading(true);

    try {

      const formData = new FormData();

      formData.append("file", file);

      const endpoint =
        type === "photo"
          ? "/api/upload/image"
          : "/api/upload/audio";

      const res = await fetch(endpoint, {

        method: "POST",

        body: formData,

      });

      if (!res.ok) {

        throw new Error("Upload failed");

      }

      return await res.json();

    } finally {

      setIsUploading(false);

    }

  };

  const handleFiles = useCallback(

    async (files: FileList | File[]) => {

      const fileArray = Array.from(files);

      const validFiles =
        type === "photo"

          ? fileArray.filter((f) =>
              f.type.startsWith("image/")
            )

          : fileArray.filter(
              (f) =>
                f.type.startsWith("audio/") ||
                /\.(mp3|wav|ogg|m4a|aac)$/i.test(
                  f.name
                )
            );

      for (const file of validFiles) {

        if (type === "photo") {

          const preview =
            URL.createObjectURL(file);

          setPreviews((p) => [...p, preview]);

          const uploaded =
            await uploadFile(file);

          onUpload(uploaded as Photo);

          if (!multiple) break;

          continue;
        }

        // AUDIO

        setSelectedAudio(file);

        setShowEditor(true);

        break;
      }

    },

    [type, multiple]
  );

  const handleAudioSave = async (
    snippet: {
      snippetStart: number;
      snippetEnd: number;
      duration: number;
    }
  ) => {

    if (!selectedAudio) return;

    try {

      const uploaded =
        await uploadFile(selectedAudio);

      onUpload({
        ...(uploaded as AudioUploadResult),

        snippetStart: snippet.snippetStart,

        snippetEnd: snippet.snippetEnd,

      } as any);

      setShowEditor(false);

      setSelectedAudio(null);

    } catch (err) {

      console.error(err);

    }

  };

  const onDrop = (
    e: React.DragEvent
  ) => {

    e.preventDefault();

    setDragOver(false);

    handleFiles(e.dataTransfer.files);

  };
    return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!isUploading) {
          onOpenChange(value);

          if (!value) {
            setShowEditor(false);
            setSelectedAudio(null);
          }
        }
      }}
    >
      <DialogContent
        className={cn(
          showEditor
            ? "max-w-6xl h-[90vh]"
            : "sm:max-w-md"
        )}
      >
        <DialogHeader>
          <DialogTitle>
            {showEditor
              ? "Choose your music snippet"
              : `Upload ${type === "photo" ? "Photos" : "Audio"}`}
          </DialogTitle>
        </DialogHeader>

        {showEditor && selectedAudio ? (
          <AudioSnippetEditor
            audioUrl={selectedAudio}
            showSaveButton
            onSave={handleAudioSave}
          />
        ) : (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all",
                dragOver
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />

                  <p className="text-sm text-muted-foreground">
                    Uploading...
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mb-4 text-primary" />

                  <h3 className="font-semibold text-lg">
                    Drag & Drop
                  </h3>

                  <p className="text-sm text-muted-foreground mt-2">
                    or click anywhere to browse
                  </p>

                  <input
                    type="file"
                    accept={
                      type === "photo"
                        ? "image/*"
                        : "audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                    }
                    multiple={
                      multiple && type === "photo"
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFiles(e.target.files);
                      }
                    }}
                  />
                </>
              )}
            </div>

            {type === "photo" &&
              previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-5">
                  {previews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden"
                    >
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function UploadButton({
  type,
  onClick,
}: {
  type: "photo" | "audio";
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="gap-2 rounded-xl"
    >
      {type === "photo" ? (
        <ImageIcon className="h-4 w-4" />
      ) : (
        <Music className="h-4 w-4" />
      )}

      Upload {type === "photo" ? "Photos" : "Audio"}
    </Button>
  );
}