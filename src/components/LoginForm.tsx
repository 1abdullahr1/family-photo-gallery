"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  title?: string;
  subtitle?: string;
}

export default function LoginForm({
  title = "The Family Album",
  subtitle = "Private archive of our moments and memories",
}: LoginFormProps) {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!accessCode.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || "Incorrect access code. Please try again.");
        if (data.retryAfter) {
          setRetryAfter(data.retryAfter);
        }
        setIsLoading(false);
        return;
      }

      // Authentication succeeded, navigate to gallery
      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("Unable to connect to the server. Please check your connection.");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-album-surface border border-album-border rounded-lg p-8 sm:p-10 shadow-photo">
        <div className="text-center mb-8">
          <span className="inline-block text-xs uppercase tracking-widest text-album-ink-faint font-medium mb-3">
            Private Gallery
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-album-ink tracking-tight font-normal mb-2">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-album-ink-muted leading-relaxed font-sans">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="accessCode"
              className="block text-xs font-medium text-album-ink-muted uppercase tracking-wider mb-2"
            >
              Access Code
            </label>
            <input
              id="accessCode"
              type="password"
              autoComplete="current-password"
              placeholder="Enter family access code"
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isLoading || (retryAfter !== null && retryAfter > 0)}
              required
              className="w-full px-3.5 py-2.5 bg-album-bg border border-album-border rounded text-sm text-album-ink placeholder-album-ink-faint focus:bg-album-surface focus:border-album-ink focus:outline-none transition-colors duration-150"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded bg-[#FAF1EE] border border-[#F0D5CD] text-xs text-[#8A3826] leading-relaxed"
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !accessCode.trim() || (retryAfter !== null && retryAfter > 0)}
            className="w-full py-2.5 px-4 bg-album-button hover:bg-album-button-hover text-white text-sm font-medium rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-album-button/20"
          >
            {isLoading ? "Verifying..." : "Unlock Album"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-album-border-light text-center">
          <p className="text-[11px] text-album-ink-faint">
            Protected for family & friends. Never share the code publicly.
          </p>
        </div>
      </div>
    </div>
  );
}
