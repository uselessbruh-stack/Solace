"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { X, MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResizableImageView(props: any) {
  const { src, alt, width, float: floatDir } = props.node.attrs;
  const [imgWidth, setImgWidth] = useState<number>(width || 300);
  const [isResizing, setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const clampWidth = useCallback((w: number) => {
    const maxW = (wrapperRef.current?.closest(".ProseMirror")?.clientWidth || 650) - 20;
    return Math.max(80, Math.min(w, maxW));
  }, []);

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = imgWidth;

      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startXRef.current;
        setImgWidth(clampWidth(startWidthRef.current + delta));
      };
      const onUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [imgWidth, clampWidth]
  );

  useEffect(() => {
    if (width && width !== imgWidth && !isResizing) setImgWidth(width);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  useEffect(() => {
    if (!isResizing && imgWidth !== (width || 300)) {
      props.updateAttributes({ width: imgWidth });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing]);

  // Cycle float: left → right → none → left
  const cycleFloat = () => {
    const next = floatDir === "left" ? "right" : floatDir === "right" ? "none" : "left";
    props.updateAttributes({ float: next });
  };

  const floatLabel = floatDir === "left" ? "Left" : floatDir === "right" ? "Right" : "Center";

  return (
    <NodeViewWrapper className={cn(
      "solace-image-wrap",
      floatDir === "left" && "solace-float-left",
      floatDir === "right" && "solace-float-right",
      floatDir === "none" && "solace-float-none",
    )}>
      <div
        ref={wrapperRef}
        contentEditable={false}
        className="relative select-none"
        style={{ width: imgWidth }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isResizing && setShowControls(false)}
      >
        <img
          src={src}
          alt={alt || ""}
          className={cn(
            "rounded-md w-full h-auto block",
            props.selected && "ring-2 ring-foreground/50"
          )}
          draggable={false}
        />

        {/* Controls overlay (on hover) */}
        {showControls && props.editor.isEditable && (
          <>
            {/* Float toggle button */}
            <button
              onClick={cycleFloat}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute top-1.5 left-1.5 h-6 flex items-center gap-1 px-1.5 rounded bg-black/60 text-white hover:bg-black/80 transition-colors z-10 text-[10px]"
              title={`Position: ${floatLabel} (click to change)`}
            >
              <MoveHorizontal className="h-3 w-3" />
              <span>{floatLabel}</span>
            </button>

            {/* Delete button */}
            <button
              onClick={props.deleteNode}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
              title="Delete"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Resize handle */}
            <div
              onMouseDown={onResizeStart}
              className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-10"
            >
              <svg viewBox="0 0 16 16" className="w-full h-full text-white drop-shadow-md">
                <path d="M14 14L8 14M14 14L14 8M14 14L6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </div>
          </>
        )}

        {isResizing && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
            {Math.round(imgWidth)}px
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const ResizableImage = Node.create({
  name: "resizableImage",
  group: "block",
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      width: { default: 300 },
      float: { default: "left" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="resizable-image"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "resizable-image" }),
      ["img", { src: HTMLAttributes.src, alt: HTMLAttributes.alt || "", style: HTMLAttributes.width ? `width:${HTMLAttributes.width}px;border-radius:6px` : "border-radius:6px" }],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
