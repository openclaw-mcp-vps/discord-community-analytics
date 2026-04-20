"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChurnPredictionRow } from "@/lib/types";

interface ChurnPredictionProps {
  rows: ChurnPredictionRow[];
}

function riskVariant(level: ChurnPredictionRow["riskLevel"]) {
  if (level === "high") {
    return "danger" as const;
  }
  if (level === "medium") {
    return "warning" as const;
  }
  return "success" as const;
}

export function ChurnPrediction({ rows }: ChurnPredictionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>At-Risk Member Predictions</CardTitle>
        <CardDescription>
          Churn score combines recency, trend slowdown, and consistency over the last 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rows.slice(0, 8).map((row) => (
            <div key={row.memberId} className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#f0f6fc]">{row.memberName}</p>
                  <p className="text-xs text-[#8b949e]">
                    {row.daysSinceLastMessage}d since last message • {row.recentMessages} recent msgs
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={riskVariant(row.riskLevel)}>{row.riskLevel.toUpperCase()}</Badge>
                  <p className="mt-1 text-xs text-[#8b949e]">risk score {row.riskScore}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-[#8b949e]">{row.reasons.join(" | ") || "Healthy engagement pattern"}</p>
            </div>
          ))}

          {rows.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#30363d] p-4 text-sm text-[#8b949e]">
              Not enough member activity yet to compute churn risk.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
