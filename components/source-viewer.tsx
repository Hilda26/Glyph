"use client";

import { RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

export function SourceViewer({ src, label }: { src: string; label: string }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);

  return (
    <section aria-label="Source image workbench" className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="rounded border border-[#191714]/30 p-2" onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))} title="Zoom out"><ZoomOut size={18} /></button>
        <button className="rounded border border-[#191714]/30 p-2" onClick={() => setZoom((value) => Math.min(2.2, value + 0.1))} title="Zoom in"><ZoomIn size={18} /></button>
        <button className="rounded border border-[#191714]/30 p-2" onClick={() => setRotation((value) => value - 90)} title="Rotate left"><RotateCcw size={18} /></button>
        <button className="rounded border border-[#191714]/30 p-2" onClick={() => setRotation((value) => value + 90)} title="Rotate right"><RotateCw size={18} /></button>
        <label className="mono text-xs">Brightness <input aria-label="Brightness" type="range" min="0.75" max="1.35" step="0.05" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} /></label>
        <label className="mono text-xs">Contrast <input aria-label="Contrast" type="range" min="0.75" max="1.5" step="0.05" value={contrast} onChange={(event) => setContrast(Number(event.target.value))} /></label>
      </div>
      <div className="relative min-h-[62vh] overflow-auto border border-[#191714]/25 bg-[#d9cfbb] p-6">
        <div className="relative mx-auto aspect-[4/3] min-w-[420px] max-w-4xl origin-center" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)`, filter: `brightness(${brightness}) contrast(${contrast})` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={label} className="h-full w-full object-contain" />
        </div>
      </div>
    </section>
  );
}
