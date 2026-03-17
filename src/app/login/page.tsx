"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function signInWithGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Logo / wordmark */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            buildr
          </h1>
          <p className="mt-2 text-sm text-white/35">
            Your canvas-first AI workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111115] border border-white/[0.07] rounded-2xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
          <h2 className="text-sm font-medium text-white/80 mb-1">
            Sign in to continue
          </h2>
          <p className="text-xs text-white/30 mb-6">
            Your API keys never leave your browser.
          </p>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] hover:border-white/[0.14] text-white/75 hover:text-white text-sm py-2.5 px-4 rounded-xl transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
          >
            {/* Google icon */}
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Redirecting..." : "Continue with Google"}
          </button>
        </div>

        <p className="text-center text-[11px] text-white/20 mt-6">
          By signing in you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
