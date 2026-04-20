"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
    } else {
      router.push("/login?registered=1");
    }
  }

  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-sm font-bold text-white">R</div>
            <span className="text-white text-xl font-semibold">ReachX</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-500 text-sm">Start sending smarter emails today</p>
        </div>

        <div className="bg-[#0e1120] border border-white/8 rounded-2xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Name</label>
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#161929] border-white/10 text-white placeholder:text-gray-600 rounded-xl h-11 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Email</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#161929] border-white/10 text-white placeholder:text-gray-600 rounded-xl h-11 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Password</label>
              <Input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-[#161929] border-white/10 text-white placeholder:text-gray-600 rounded-xl h-11 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
              />
            </div>

            {error && (
              <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors rounded-xl py-2.5 font-semibold text-sm text-white mt-2"
            >
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
