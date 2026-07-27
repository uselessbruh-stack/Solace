"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";
import type { Region } from "wavesurfer.js/dist/plugins/regions.js";

interface Props {
  url: string;
  start: number;
  end: number;
  zoom: number;
  maxSnippet?: number;
  onReady: (ws: WaveSurfer, duration: number) => void;
  onTimeUpdate: (time: number) => void;
  onRegionChange: (start: number, end: number) => void;
}

export default function Waveform({
  url,
  start,
  end,
  zoom,
  maxSnippet = 70,
  onReady,
  onTimeUpdate,
  onRegionChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<WaveSurfer | null>(null);
  const regionRef = useRef<Region | null>(null);
  const isDraggingRef = useRef(false);
  const onRegionChangeRef = useRef(onRegionChange);
  onRegionChangeRef.current = onRegionChange;

  useEffect(() => {
    if (!containerRef.current || !url) return;

    const regions = RegionsPlugin.create();
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#A855F7",
      progressColor: "#7C3AED",
      cursorColor: "#ffffff",
      cursorWidth: 2,
      barWidth: 3,
      barRadius: 6,
      barGap: 2,
      height: 120,
      normalize: true,
      dragToSeek: true,
      url,
      plugins: [regions],
    });

    waveRef.current = ws;

    ws.once("ready", () => {
      const duration = ws.getDuration();
      const region = regions.addRegion({
        start,
        end: Math.min(end, duration),
        drag: true,
        resize: true,
        color: "rgba(168,85,247,0.25)",
        minLength: 1,
        maxLength: maxSnippet,
      });

      regionRef.current = region;
      onReady(ws, duration);
    });

    regions.on("region-update", (region) => {
      isDraggingRef.current = true;
      onRegionChangeRef.current(region.start, region.end);
    });

    regions.on("region-updated", (region) => {
      isDraggingRef.current = false;
      onRegionChangeRef.current(region.start, region.end);
    });

    ws.on("timeupdate", (time) => {
      onTimeUpdate(time);
      const region = regionRef.current;
      if (region && time >= region.end) {
        ws.pause();
        ws.setTime(region.start);
      }
    });

    return () => {
      regionRef.current = null;
      ws.destroy();
      waveRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    const wave = waveRef.current;
    if (!wave || !wave.getDecodedData()) return;
    wave.zoom(zoom);
  }, [zoom]);

  useEffect(() => {
    const region = regionRef.current;
    if (!region || isDraggingRef.current) return;

    const startChanged = Math.abs(region.start - start) > 0.01;
    const endChanged = Math.abs(region.end - end) > 0.01;

    if (startChanged || endChanged) {
      region.setOptions({ start, end });
    }
  }, [start, end]);

  return (
    <div className="rounded-2xl overflow-x-auto border border-border bg-card">
      <div ref={containerRef} className="w-full min-h-[120px]" />
    </div>
  );
}
