"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrendPoint } from "@/lib/types";

interface EngagementChartProps {
  data: TrendPoint[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Frequency Trend</CardTitle>
        <CardDescription>Daily message volume and active speaker count.</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#30363d" strokeDasharray="4 4" />
            <XAxis dataKey="date" tick={{ fill: "#8b949e", fontSize: 11 }} />
            <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b22",
                borderColor: "#30363d",
                color: "#e6edf3",
              }}
            />
            <Line
              type="monotone"
              dataKey="messages"
              stroke="#2f81f7"
              strokeWidth={2}
              dot={false}
              name="Messages"
            />
            <Line
              type="monotone"
              dataKey="activeMembers"
              stroke="#3fb950"
              strokeWidth={2}
              dot={false}
              name="Active Members"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
