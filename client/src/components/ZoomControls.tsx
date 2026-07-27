"use client";

import { Minus, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  zoom: number;
  onZoom: (zoom: number) => void;
}

export default function ZoomControls({
  zoom,
  onZoom,
}: Props) {
  const increase = () => {
    onZoom(Math.min(zoom + 20, 300));
  };

  const decrease = () => {
    onZoom(Math.max(0, zoom - 20));
  };

  return (
    <div className="flex items-center justify-center gap-4">

      <Button
        size="icon"
        variant="outline"
        onClick={decrease}
      >
        <Minus className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 px-4">

        <Search className="w-4 h-4 text-muted-foreground" />

        <div className="text-sm">

          Zoom

          <span className="ml-2 font-semibold">

            {zoom}%

          </span>

        </div>

      </div>

      <Button
        size="icon"
        variant="outline"
        onClick={increase}
      >
        <Plus className="h-4 w-4" />
      </Button>

    </div>
  );
}