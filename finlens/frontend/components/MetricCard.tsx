"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  color?: string;
}

export default function MetricCard({ title, value, change, color = "text-white" }: MetricCardProps) {
  return (
    <Card className="bg-zinc-950/50 border-zinc-800/50 shadow-xl overflow-hidden group hover:border-zinc-700/50 transition-all duration-300">
      <CardContent className="p-6">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">
          {title}
        </p>
        <h3 className={`text-3xl font-black tracking-tighter mb-2 ${color}`}>
          {value}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600 font-bold bg-zinc-900/50 px-2 py-0.5 rounded-full border border-zinc-800/50">
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}