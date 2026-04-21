import type { WordCloudToken } from "@/lib/types";

interface WordCloudProps {
  words: WordCloudToken[];
}

export function WordCloud({ words }: WordCloudProps) {
  const max = Math.max(...words.map((word) => word.value), 1);

  return (
    <div className="flex min-h-[320px] flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      {words.map((word, idx) => {
        const size = 12 + Math.round((word.value / max) * 34);
        const rotate = idx % 5 === 0 ? "-rotate-6" : idx % 7 === 0 ? "rotate-6" : "";
        const color =
          idx % 4 === 0
            ? "text-sky-300"
            : idx % 4 === 1
              ? "text-amber-300"
              : idx % 4 === 2
                ? "text-emerald-300"
                : "text-cyan-300";

        return (
          <span
            key={word.text}
            className={`${rotate} ${color} inline-block font-semibold transition-transform hover:scale-110`}
            style={{ fontSize: `${size}px` }}
            title={`${word.text}: ${word.value} mentions`}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
}
