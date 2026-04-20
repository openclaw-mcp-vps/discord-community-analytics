"use client";

import dynamic from "next/dynamic";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { WordCloudItem } from "@/lib/types";

const ReactWordcloud = dynamic(() => import("react-wordcloud"), { ssr: false });

interface WordCloudProps {
  words: WordCloudItem[];
}

export function WordCloud({ words }: WordCloudProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hot Topics</CardTitle>
        <CardDescription>Terms with sustained repetition across recent discussions.</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {words.length > 0 ? (
          <ReactWordcloud
            words={words}
            options={{
              colors: ["#2f81f7", "#79c0ff", "#3fb950", "#e3b341", "#ff7b72"],
              deterministic: true,
              fontFamily: "var(--font-space-grotesk)",
              fontSizes: [14, 48],
              rotations: 2,
              rotationAngles: [0, 90],
            }}
          />
        ) : (
          <p className="rounded-lg border border-dashed border-[#30363d] p-4 text-sm text-[#8b949e]">
            No repeated topic terms yet. Once message flow starts, this cloud highlights what your community keeps discussing.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
