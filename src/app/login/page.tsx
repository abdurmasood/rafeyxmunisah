'use client';

import { useState, useEffect } from 'react';
import { Heart, User, Lock } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isAuthenticated, isLoading: contextLoading } = useUser();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!contextLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, contextLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(username.trim().toLowerCase(), password);
      
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (contextLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Heart className="w-12 h-12 text-red-500 fill-red-500 animate-heartbeat" strokeWidth={1} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Heart 
            className="w-16 h-16 text-red-500 fill-red-500 mx-auto mb-4 animate-heartbeat" 
            strokeWidth={1}
          />
          <h1 className="font-courier-prime text-3xl text-white tracking-wider mb-2">
            Rafey x Munisah
          </h1>
          <p className="text-white/60 text-sm">
            To Infinity.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" strokeWidth={1} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#e71d36] focus:bg-white/10 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" strokeWidth={1} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#e71d36] focus:bg-white/10 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !username.trim() || !password.trim()}
            className="w-full bg-[#e71d36] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-[#e71d36]/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#e71d36]/50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Helper Text */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-xs">
            Enter your username and password to get access.
          </p>
        </div>
      </div>
    </div>
  );
}