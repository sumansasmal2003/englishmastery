"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Lock, Loader2, AlertCircle, ArrowLeft,
  Eye, EyeOff, ShieldCheck, User
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    } else {
      router.push("/add-chapter");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-200 font-sans selection:bg-indigo-500/20 relative flex items-center justify-center p-6">

      {/* --- BACKGROUND PATTERN (Matches Home Page) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#ffffff00,white)] dark:bg-[radial-gradient(circle_800px_at_50%_200px,#00000000,#050505)]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Navigation Back */}
        <div className="mb-6 flex justify-center">
             <Link href="/" className="group flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors bg-white/50 dark:bg-black/50 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Return to EnglishMastery
             </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden relative">

            {/* Decorative Top Gradient */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <div className="p-8 pt-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Admin Portal</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Secure access for content management</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Username Input */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1">Username</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-3 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none text-sm font-medium transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:text-white placeholder:text-zinc-400"
                                placeholder="Enter admin username"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1">Password</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-3 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none text-sm font-medium transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:text-white placeholder:text-zinc-400"
                                placeholder="••••••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    <motion.div animate={{ height: error ? 'auto' : 0, opacity: error ? 1 : 0 }} className="overflow-hidden">
                        {error && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium mt-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2 mt-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <span>Access Dashboard</span>
                        )}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-zinc-50/50 dark:bg-zinc-950/30 border-t border-zinc-100 dark:border-zinc-800/50 text-center">
                <p className="text-[10px] text-zinc-400 font-medium">
                    Protected by EnglishMastery Secure Auth
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
