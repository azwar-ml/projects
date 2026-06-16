"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (type: "login" | "register") => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    try {
      const res = await fetch(`${API_URL}/auth/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (res.ok) {
        if (type === "login") {
          localStorage.setItem("token", data.access_token);
          router.push("/dashboard");
        } else {
          setError("");
          setEmail("");
          setPassword("");
          setIsLogin(true);
          // Success message without blocking redirect
        }
      } else {
        setError(data.message || "Authentication failed. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05050a] via-zinc-900 to-[#0a0a12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/5 blur-3xl rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/5 blur-3xl rounded-full -z-10 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-600/5 blur-3xl rounded-full -z-10 -translate-x-1/2 -translate-y-1/2" />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-3">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              FinLens
            </span>
            <span className="text-white ml-2">AI</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg">Smart Financial Management</p>
        </div>

        {/* Auth Card */}
        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 rounded-2xl p-8 md:p-10 shadow-2xl">
          {/* Tab Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                isLogin
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30"
                  : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <LogIn size={20} />
              <span>Login</span>
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                !isLogin
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30"
                  : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <UserPlus size={20} />
              <span>Register</span>
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 h-12 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 h-12 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={() => handleAuth(isLogin ? "login" : "register")}
            disabled={loading}
            className={`w-full h-12 font-bold text-base rounded-xl transition-all duration-300 shadow-lg ${
              isLogin
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-violet-600/50"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-cyan-600/50"
            } hover:opacity-90 disabled:opacity-50`}
          >
            {loading
              ? isLogin
                ? "Logging in..."
                : "Creating account..."
              : isLogin
              ? "Login"
              : "Register"}
          </Button>

          {/* Footer */}
          <p className="text-center text-zinc-500 text-sm mt-6">
            {isLogin ? "New here? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
            >
              {isLogin ? "Register now" : "Login here"}
            </button>
          </p>
        </div>

        {/* Features */}
        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          <div className="text-zinc-400">
            <div className="text-2xl font-bold text-violet-400">💰</div>
            <p className="text-xs mt-1">Track Spending</p>
          </div>
          <div className="text-zinc-400">
            <div className="text-2xl font-bold text-cyan-400">📊</div>
            <p className="text-xs mt-1">Analytics</p>
          </div>
          <div className="text-zinc-400">
            <div className="text-2xl font-bold text-indigo-400">🤖</div>
            <p className="text-xs mt-1">AI Insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}