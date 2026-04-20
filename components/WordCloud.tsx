"use client";

import dynamic from "next/dynamic";
import type { WordFrequency } from "@/lib/types";

const ReactWordcloud = dynamic(() => import("react-wordcloud"), { ssr: false });

interface WordCloudProps {
  words: WordFrequency[];
}

const options = {
  colors: ["#38bdf8", "#22d3ee", "#f59e0b", "#34d399", "#f97316"],
  enableTooltip: true,
  deterministic: true,
  fontFamily: "Space Grotesk, ui-sans-serif, system-ui",
  fontSizes: [16, 58] as [number, number],
  rotations: 2,
  rotationAngles: [0, 90] as [number, number],
  scale: "sqrt" as const,
  spiral: "archimedean" as const,
  transitionDuration: 500
};

export default function WordCloud({ words }: WordCloudProps) {
  if (words.length === 0) {
    return <p className="text-sm text-slate-400">No topic data available yet.</p>;
  }

  return (
    <div className="h-[320px] w-full rounded-lg border border-slate-800 bg-slate-900/50 p-2">
      <ReactWordcloud words={words} options={options} />
    </div>
  );
}
