"use client";

import { Slider } from "@/components/ui/slider";

interface Props {
  duration: number;
  start: number;
  end: number;
  maxSnippet?: number;
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
}

function format(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function clampSnippet(
  newStart: number,
  newEnd: number,
  duration: number,
  maxSnippet: number,
  prevStart: number,
  prevEnd: number
) {
  let start = Math.max(0, Math.min(newStart, duration));
  let end = Math.max(0, Math.min(newEnd, duration));

  if (end <= start) {
    end = Math.min(duration, start + 1);
  }

  if (end - start > maxSnippet) {
    const startMoved = Math.abs(newStart - prevStart) >= Math.abs(newEnd - prevEnd);
    if (startMoved) {
      end = Math.min(duration, start + maxSnippet);
    } else {
      start = Math.max(0, end - maxSnippet);
    }
  }

  return { start, end };
}

export default function TimelineSlider({
  duration,
  start,
  end,
  maxSnippet = 30,
  onStartChange,
  onEndChange,
}: Props) {
  if (duration <= 0) return null;

  return (
    <div className="space-y-4">
      <Slider
        min={0}
        max={duration}
        step={0.1}
        value={[start, end]}
        onValueChange={(values) => {
          if (!Array.isArray(values) || values.length < 2) return;

          const [rawStart, rawEnd] = values;
          const { start: nextStart, end: nextEnd } = clampSnippet(
            rawStart,
            rawEnd,
            duration,
            maxSnippet,
            start,
            end
          );

          if (nextStart !== start) onStartChange(nextStart);
          if (nextEnd !== end) onEndChange(nextEnd);
        }}
        className="py-2"
      />

      <div className="flex justify-between text-sm text-muted-foreground">
        <div className="text-center">
          <p className="font-semibold text-foreground">Start</p>
          <p>{format(start)}</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">Length</p>
          <p>{format(end - start)}</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">End</p>
          <p>{format(end)}</p>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Drag the highlighted region on the waveform, or use the slider above (max {maxSnippet}s)
      </p>
    </div>
  );
}
