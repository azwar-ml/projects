"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white p-8 max-w-2xl mx-auto flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-8 bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Settings</h1>
      <div className="space-y-6 bg-zinc-950/50 border border-zinc-800 p-8 rounded-2xl backdrop-blur-xl">
        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase font-black tracking-widest">Full Name</label>
          <Input defaultValue="Azwar Malhi" className="bg-zinc-900 border-zinc-800 focus:ring-violet-500" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase font-black tracking-widest">DevAlloy Agency Email</label>
          <Input disabled defaultValue="azwar@superior.edu.pk" className="bg-zinc-900 border-zinc-800 opacity-50 cursor-not-allowed" />
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700 w-full font-bold py-6 rounded-xl shadow-lg shadow-violet-600/20">
          Update Profile
        </Button>
      </div>
    </div>
  );
}