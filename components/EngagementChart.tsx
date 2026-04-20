"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { EngagementTrendPoint } from "@/lib/types";

interface EngagementChartProps {
  data: EngagementTrendPoint[];
}

export default function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.7} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#64748b", fontSize: 11 }}
            minTickGap={18}
            tickLine={false}
            axisLine={{ stroke: "#1e293b" }}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#1e293b" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0b1220",
              borderColor: "#1e293b",
              color: "#dbeafe"
            }}
            labelStyle={{ color: "#94a3b8" }}
          />
          <Area
            type="monotone"
            dataKey="messages"
            stroke="#38bdf8"
            fillOpacity={1}
            fill="url(#messagesGradient)"
            strokeWidth={2}
            name="Messages"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
