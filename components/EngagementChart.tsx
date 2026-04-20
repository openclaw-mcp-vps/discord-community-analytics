"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyEngagementPoint } from "@/lib/types";

interface EngagementChartProps {
  data: DailyEngagementPoint[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="dateLabel" stroke="#7d8590" tickLine={false} axisLine={false} />
          <YAxis stroke="#7d8590" tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#161b22",
              borderColor: "#30363d",
              borderRadius: "0.5rem",
              color: "#e6edf3"
            }}
          />
          <Line
            type="monotone"
            dataKey="messageCount"
            stroke="#58a6ff"
            strokeWidth={2.5}
            dot={false}
            name="Messages"
          />
          <Line
            type="monotone"
            dataKey="activeMembers"
            stroke="#7ee787"
            strokeWidth={2.5}
            dot={false}
            name="Active Members"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
