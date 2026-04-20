"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { ChurnPrediction } from "@/lib/types";

interface ChurnRiskTableProps {
  predictions: ChurnPrediction[];
}

function levelToBadge(level: ChurnPrediction["riskLevel"]) {
  if (level === "high") {
    return "danger";
  }
  if (level === "medium") {
    return "warning";
  }
  return "success";
}

export default function ChurnRiskTable({ predictions }: ChurnRiskTableProps) {
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const filtered = useMemo(() => {
    if (filter === "all") {
      return predictions;
    }
    return predictions.filter((member) => member.riskLevel === filter);
  }, [filter, predictions]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(["all", "high", "medium", "low"] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setFilter(level)}
            className={`rounded-md border px-3 py-1.5 capitalize transition ${
              filter === level
                ? "border-sky-500 bg-sky-500/15 text-sky-300"
                : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Inactive</TableHead>
            <TableHead>Recent 30d</TableHead>
            <TableHead>Prior 30d</TableHead>
            <TableHead>Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((member) => (
            <TableRow key={member.memberId}>
              <TableCell className="font-medium">{member.username}</TableCell>
              <TableCell>
                <Badge variant={levelToBadge(member.riskLevel)}>
                  {member.riskLevel.toUpperCase()} ({member.riskScore})
                </Badge>
              </TableCell>
              <TableCell>{member.daysInactive} days</TableCell>
              <TableCell>{member.recentMessages}</TableCell>
              <TableCell>{member.previousMessages}</TableCell>
              <TableCell
                className={
                  member.trendDelta < 0 ? "text-rose-300" : "text-emerald-300"
                }
              >
                {member.trendDelta > 0 ? "+" : ""}
                {member.trendDelta}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
