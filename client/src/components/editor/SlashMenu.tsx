"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { type Editor } from "@tiptap/react";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Minus,
  ImageIcon,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SlashMenuItem {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: (editor: Editor) => void;
  isMedia?: boolean;
}

interface SlashMenuProps {
  editor: Editor | null;
  onImageUpload: () => void;
  onMusicSearch: () => void;
}

export function SlashMenu({ editor, onImageUpload, onMusicSearch }: SlashMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const items: SlashMenuItem[] = [
    {
      label: "Text",
      description: "Plain text paragraph",
      icon: Type,
      command: (ed) => ed.chain().focus().setParagraph().run(),
    },
    {
      label: "Heading 1",
      description: "Large heading",
      icon: Heading1,
      command: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "Heading 2",
      description: "Medium heading",
      icon: Heading2,
      command: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Heading 3",
      description: "Small heading",
      icon: Heading3,
      command: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bullet List",
      description: "Unordered list",
      icon: List,
      command: (ed) => ed.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered List",
      description: "Ordered list",
      icon: ListOrdered,
      command: (ed) => ed.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Checklist",
      description: "To-do items",
      icon: CheckSquare,
      command: (ed) => ed.chain().focus().toggleTaskList().run(),
    },
    {
      label: "Code Block",
      description: "Syntax highlighted code",
      icon: Code,
      command: (ed) => ed.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: "Quote",
      description: "Block quote",
      icon: Quote,
      command: (ed) => ed.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Divider",
      description: "Horizontal rule",
      icon: Minus,
      command: (ed) => ed.chain().focus().setHorizontalRule().run(),
    },
    {
      label: "Image",
      description: "Upload or embed an image",
      icon: ImageIcon,
      command: () => onImageUpload(),
      isMedia: true,
    },
    {
      label: "Music",
      description: "Search and add a track",
      icon: Music,
      command: () => onMusicSearch(),
      isMedia: true,
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(filter.toLowerCase()) ||
      item.description.toLowerCase().includes(filter.toLowerCase())
  );

  const executeCommand = useCallback(
    (item: SlashMenuItem) => {
      if (!editor) return;

      // Delete the "/" and any filter text
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 20),
        from,
        ""
      );
      const slashIndex = textBefore.lastIndexOf("/");
      if (slashIndex >= 0) {
        const deleteFrom = from - (textBefore.length - slashIndex);
        editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run();
      }

      item.command(editor);
      setIsOpen(false);
      setFilter("");
    },
    [editor]
  );

  // Watch for "/" typed at start of an empty block
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredItems.length - 1));
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (event.key === "Enter") {
          event.preventDefault();
          if (filteredItems[selectedIndex]) {
            executeCommand(filteredItems[selectedIndex]);
          }
        } else if (event.key === "Escape") {
          event.preventDefault();
          setIsOpen(false);
          setFilter("");
        }
      }
    };

    const handleUpdate = () => {
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 20),
        from,
        ""
      );

      // Check if we have a "/" that should trigger the menu
      const slashIndex = textBefore.lastIndexOf("/");
      if (slashIndex >= 0) {
        const textAfterSlash = textBefore.slice(slashIndex + 1);

        // Only open if slash is at the start of a line or after whitespace
        const charBeforeSlash = slashIndex > 0 ? textBefore[slashIndex - 1] : "\n";
        if (
          charBeforeSlash === "\n" ||
          charBeforeSlash === " " ||
          slashIndex === 0
        ) {
          setFilter(textAfterSlash);
          setSelectedIndex(0);
          setIsOpen(true);

          // Get cursor position for menu placement
          const coords = editor.view.coordsAtPos(from);
          const editorRect = editor.view.dom.getBoundingClientRect();
          setPosition({
            top: coords.bottom - editorRect.top + 4,
            left: coords.left - editorRect.left,
          });
          return;
        }
      }

      setIsOpen(false);
      setFilter("");
    };

    editor.on("update", handleUpdate);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      editor.off("update", handleUpdate);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, isOpen, filteredItems, selectedIndex, executeCommand]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFilter("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  if (!isOpen || filteredItems.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 slash-menu animate-slide-up"
      style={{ top: position.top, left: position.left }}
    >
      {filteredItems.map((item, index) => (
        <button
          key={item.label}
          className={cn(
            "slash-menu-item",
            index === selectedIndex && "is-selected"
          )}
          onClick={() => executeCommand(item)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <div className="slash-menu-item-icon">
            <item.icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="slash-menu-item-label">{item.label}</div>
            <div className="slash-menu-item-description">
              {item.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
