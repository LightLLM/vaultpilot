"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "Mon", automated: 120 },
  { day: "Tue", automated: 89 },
  { day: "Wed", automated: 0 },
  { day: "Thu", automated: 210 },
  { day: "Fri", automated: 142 },
  { day: "Sat", automated: 0 },
  { day: "Sun", automated: 19 },
];

export function SpendTrend() {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="fillAuto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(221 83% 40%)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="hsl(221 83% 40%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(215 16% 40%)" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="hsl(215 16% 40%)"
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(214 32% 88%)",
              fontSize: 12,
            }}
            formatter={(value: number) => [`$${value}`, "Automated (mock)"]}
          />
          <Area
            type="monotone"
            dataKey="automated"
            stroke="hsl(221 83% 40%)"
            fillOpacity={1}
            fill="url(#fillAuto)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Illustrative 7-day trend — mock series for dashboard polish
      </p>
    </div>
  );
}
