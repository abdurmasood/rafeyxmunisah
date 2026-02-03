"use client";

import { useState, useEffect } from "react";
import { User, Lock } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, isAuthenticated, isLoading: contextLoading } = useUser();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!contextLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, contextLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username.trim().toLowerCase(), password);

      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (contextLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div
          className="text-[var(--muted-foreground)] text-sm tracking-widest uppercase animate-pulse"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-10">
        {/* Logo/Title */}
        <div className="text-center space-y-3">
          <h1
            className="text-3xl text-[var(--foreground)] tracking-wide"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Our Memories
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm tracking-wide">
            A shared space for moments together
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="relative">
              <User
                className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]"
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                disabled={isLoading}
                className="w-full bg-transparent border-b-2 border-[var(--border)] pl-8 pb-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200 disabled:opacity-50"
              />
            </div>
            <div className="relative">
              <Lock
                className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]"
                strokeWidth={1.5}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isLoading}
                className="w-full bg-transparent border-b-2 border-[var(--border)] pl-8 pb-3 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !username.trim() || !password.trim()}
            className="w-full py-4 bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] hover:text-[var(--accent-foreground)] transition-all duration-300 ease-out rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-4 h-4 border-2 border-[var(--foreground)]/30 border-t-[var(--foreground)] rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
