"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Waveform from "./Waveform";
import AudioControls from "./AudioControls";
import TimelineSlider from "./TimelineSlider";
import ZoomControls from "./ZoomControls";

const MAX_SNIPPET = 70;

export interface SnippetSelection {
  snippetStart: number;
  snippetEnd: number;
  duration: number;
}

interface Props {
  audioUrl: string | File;
  onChange?: (snippet: SnippetSelection) => void;
  onSave?: (snippet: SnippetSelection) => void;
  showSaveButton?: boolean;
}

export default function AudioSnippetEditor({
  audioUrl: audioSource,
  onChange,
  onSave,
  showSaveButton = false,
}: Props) {
  const [resolvedUrl, setResolvedUrl] = useState("");

  useEffect(() => {
    if (typeof audioSource === "string") {
      setResolvedUrl(audioSource);
      return;
    }

    const url = URL.createObjectURL(audioSource);

    setResolvedUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioSource]);

  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(MAX_SNIPPET);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(40);
  const [waveSurfer, setWaveSurfer] = useState<import("wavesurfer.js").default | null>(null);

  const emitChange = (nextStart: number, nextEnd: number, nextDuration = duration) => {
    const snippet = {
      snippetStart: nextStart,
      snippetEnd: nextEnd,
      duration: nextDuration,
    };
    onChange?.(snippet);
  };

  const handleStartChange = (value: number) => {
    setStart(value);
    emitChange(value, end);
  };

  const handleEndChange = (value: number) => {
    setEnd(value);
    emitChange(start, value);
  };

  const handleRegionChange = (nextStart: number, nextEnd: number) => {
    setStart(nextStart);
    setEnd(nextEnd);
    emitChange(nextStart, nextEnd);
  };

  const handleSave = () => {
    onSave?.({
      snippetStart: start,
      snippetEnd: end,
      duration,
    });
  };
  console.log("Audio URL:", resolvedUrl);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card rounded-3xl p-6 space-y-6"
    >
      <h2 className="text-xl font-bold">Select your memory snippet</h2>

      {resolvedUrl && (
        <Waveform
          url={resolvedUrl}
          start={start}
          end={end}
          zoom={zoom}
          maxSnippet={MAX_SNIPPET}
          onReady={(ws, total) => {
            setWaveSurfer(ws);
            setDuration(total);

            const initialEnd = Math.min(MAX_SNIPPET, total);

            setStart(0);
            setEnd(initialEnd);

            emitChange(0, initialEnd, total);
          }}
          onTimeUpdate={setCurrentTime}
          onRegionChange={handleRegionChange}
        />
      )}

      {duration > 0 && (
        <TimelineSlider
          duration={duration}
          start={start}
          end={end}
          maxSnippet={MAX_SNIPPET}
          onStartChange={handleStartChange}
          onEndChange={handleEndChange}
        />
      )}

      <AudioControls
        waveSurfer={waveSurfer}
        start={start}
        end={end}
        currentTime={currentTime}
      />

      <ZoomControls zoom={zoom} onZoom={setZoom} />

      {showSaveButton && (
        <button
          type="button"
          className="w-full rounded-xl bg-primary text-white py-3 font-semibold hover:bg-primary/90 transition-colors"
          onClick={handleSave}
        >
          Save Snippet
        </button>
      )}
    </motion.div>
  );
}
