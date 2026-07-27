"use client";

import { useState, useCallback } from "react";
import { X, Plus } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = useCallback(() => {
    const trimmed = input.trim().toLowerCase().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }, [input, tags, onChange]);

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(tags.filter((t) => t !== tagToRemove));
    },
    [tags, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium group"
        >
          #{tag}
          <button
            onClick={() => removeTag(tag)}
            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? "Add tags..." : ""}
        className="text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground/40 min-w-[80px] flex-1"
      />
    </div>
  );
}
