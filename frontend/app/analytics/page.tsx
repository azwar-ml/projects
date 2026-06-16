"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AnalyticsPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-950 border-zinc-800 h-[300px]">
          <CardHeader>
            <CardTitle className="text-zinc-400">Spending Trends</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full text-zinc-600 italic">
            Visualizing your transaction history...
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// This line MUST be exactly like this
export default AnalyticsPage;