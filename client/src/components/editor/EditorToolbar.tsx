"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Minus,
  Highlighter,
  ImageIcon,
  Music,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload: () => void;
  onMusicSearch: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
      title={title}
      className={cn(
        "flex items-center justify-center h-7 w-7 rounded-md transition-colors",
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5" />;
}

export function EditorToolbar({
  editor,
  onImageUpload,
  onMusicSearch,
}: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const openLinkInput = useCallback(() => {
    if (!editor) return;
    // Pre-fill with existing link URL if cursor is on a link
    const existing = editor.getAttributes("link").href;
    setLinkUrl(existing || "");
    setShowLinkInput(true);
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      // If empty, remove link
      editor.chain().focus().unsetLink().run();
    } else {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      // If no text is selected, insert the URL as text with a link
      const { from, to } = editor.state.selection;
      if (from === to) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${url}</a>`)
          .run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  if (!editor) return null;

  return (
    <div className="border border-border rounded-lg bg-card p-1 mb-3 flex items-center gap-0.5 flex-wrap">
      {/* Undo / Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo2 className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive("highlight")}
        title="Highlight"
      >
        <Highlighter className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
        title="Checklist"
      >
        <CheckSquare className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      {/* Blocks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code block"
      >
        <Code className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Quote"
      >
        <Quote className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Divider"
      >
        <Minus className="h-3.5 w-3.5" />
      </ToolbarButton>

      <Divider />

      {/* Link */}
      {showLinkInput ? (
        <div className="flex items-center gap-1 ml-0.5" onMouseDown={(e) => { if ((e.target as HTMLElement).tagName !== 'INPUT') e.preventDefault(); }}>
          <input
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setLink();
              if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); }
            }}
            className="h-6 px-2 text-xs bg-secondary border border-border rounded-md outline-none w-40"
            autoFocus
          />
          <button
            onClick={setLink}
            className="text-[10px] px-1.5 py-0.5 rounded bg-foreground text-background font-medium"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowLinkInput(false);
              setLinkUrl("");
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              }
            }}
            className="text-[10px] px-1.5 py-0.5 rounded text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
      ) : (
        <ToolbarButton
          onClick={openLinkInput}
          isActive={editor.isActive("link")}
          title="Add link"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
      )}

      {/* Media */}
      <ToolbarButton onClick={onImageUpload} title="Insert image">
        <ImageIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton onClick={onMusicSearch} title="Add music">
        <Music className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
}
