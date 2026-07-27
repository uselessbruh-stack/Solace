"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import type { JSONContent } from "@tiptap/react";

import { ResizableImage } from "./ResizableImage";
import { MusicNode } from "./MusicNode";
import { EditorToolbar } from "./EditorToolbar";
import { SlashMenu } from "./SlashMenu";
import { ImageUploadDialog } from "./ImageUploadDialog";
import { MusicSearchDialog } from "./MusicSearchDialog";

const lowlight = createLowlight(common);

interface NoteEditorProps {
  content: JSONContent | null;
  onUpdate: (content: JSONContent, plainText: string, wordCount: number) => void;
  editable?: boolean;
}

// Migrate old content: convert "image" nodes → "resizableImage"
function migrateContent(doc: JSONContent | null): JSONContent | undefined {
  if (!doc) return undefined;
  return JSON.parse(
    JSON.stringify(doc, (key, value) => {
      if (key === "type" && value === "image") return "resizableImage";
      return value;
    })
  );
}

export function NoteEditor({
  content,
  onUpdate,
  editable = true,
}: NoteEditorProps) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const migratedContent = migrateContent(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing, or type "/" for commands...',
        emptyEditorClass: "is-editor-empty",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-foreground underline" },
      }),
      // Custom nodes with resize + drag
      ResizableImage,
      MusicNode,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: migratedContent,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "ProseMirror focus:outline-none min-h-[300px] px-1",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const text = editor.getText();
      const words = text
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
      onUpdate(json, text, words);
    },
  });

  const handleImageInsert = useCallback(
    (url: string, alt?: string) => {
      if (!editor) return;
      // Insert image block + empty paragraph after it for cursor
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: "resizableImage",
            attrs: { src: url, alt: alt || "", width: 300, float: "left" },
          },
          { type: "paragraph" },
        ])
        .run();
    },
    [editor]
  );

  const handleMusicInsert = useCallback(
    (track: {
      videoId: string;
      title: string;
      artist: string;
      thumbnail: string;
      duration: number;
    }) => {
      if (!editor) return;
      // Insert music block + empty paragraph after it for cursor
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: "musicBlock",
            attrs: {
              videoId: track.videoId,
              title: track.title,
              artist: track.artist,
              thumbnail: track.thumbnail,
              duration: track.duration,
              float: "left",
            },
          },
          { type: "paragraph" },
        ])
        .run();
    },
    [editor]
  );

  return (
    <div className="relative">
      {editable && (
        <EditorToolbar
          editor={editor}
          onImageUpload={() => setShowImageUpload(true)}
          onMusicSearch={() => setShowMusicSearch(true)}
        />
      )}

      <div className="relative overflow-visible">
        <EditorContent editor={editor} />
        <SlashMenu
          editor={editor}
          onImageUpload={() => setShowImageUpload(true)}
          onMusicSearch={() => setShowMusicSearch(true)}
        />
      </div>

      <ImageUploadDialog
        open={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onInsert={handleImageInsert}
      />

      <MusicSearchDialog
        open={showMusicSearch}
        onClose={() => setShowMusicSearch(false)}
        onInsert={handleMusicInsert}
      />
    </div>
  );
}
