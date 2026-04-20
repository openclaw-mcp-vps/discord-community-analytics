"use client";

import { useMemo } from "react";
import type { WordCloudTerm } from "@/lib/types";

interface WordCloudProps {
  terms: WordCloudTerm[];
}

const PALETTE = ["#58a6ff", "#7ee787", "#79c0ff", "#f2cc60", "#ffa657", "#d2a8ff"];

export function WordCloud({ terms }: WordCloudProps) {
  const normalized = useMemo(() => {
    const filtered = terms.slice(0, 40);
    const maxValue = Math.max(...filtered.map((term) => term.value), 1);

    return filtered.map((term, index) => {
      const ratio = term.value / maxValue;
      const fontSize = Math.round(14 + ratio * 30);
      const x = 10 + ((index * 17) % 80);
      const y = 8 + ((index * 23) % 82);
      const rotate = index % 5 === 0 ? -8 : index % 7 === 0 ? 8 : 0;

      return {
        ...term,
        fontSize,
        x,
        y,
        rotate,
        color: PALETTE[index % PALETTE.length]
      };
    });
  }, [terms]);

  if (!normalized.length) {
    return <p className="text-sm text-slate-400">No text signals yet. The cloud appears after meaningful message volume.</p>;
  }

  return (
    <div className="relative h-[320px] overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40">
      {normalized.map((term) => (
        <span
          key={term.text}
          className="absolute select-none font-semibold tracking-tight"
          style={{
            left: `${term.x}%`,
            top: `${term.y}%`,
            transform: `translate(-50%, -50%) rotate(${term.rotate}deg)`,
            fontSize: `${term.fontSize}px`,
            color: term.color,
            opacity: 0.93
          }}
          title={`${term.text}: ${term.value}`}
        >
          {term.text}
        </span>
      ))}
    </div>
  );
}
