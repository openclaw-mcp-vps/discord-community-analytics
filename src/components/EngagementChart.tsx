"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { DailyEngagementPoint } from "@/lib/types";

interface EngagementChartProps {
  data: DailyEngagementPoint[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickMargin={8} />
          <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} width={42} />
          <Tooltip
            contentStyle={{
              background: "#020617",
              border: "1px solid #1e293b",
              borderRadius: 12,
              color: "#e2e8f0"
            }}
          />
          <Legend wrapperStyle={{ color: "#94a3b8" }} />
          <Line
            type="monotone"
            dataKey="messages"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            name="Messages"
          />
          <Line
            type="monotone"
            dataKey="activeMembers"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            name="Active Members"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
