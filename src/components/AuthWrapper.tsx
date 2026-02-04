'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if still loading
    if (isLoading) return;

    // Allow access to login page
    if (pathname === '/login') return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--muted-foreground)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  // Only show login page if explicitly on login route
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Show loading screen if not authenticated (prevents flash while redirecting)
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--muted-foreground)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  // Show protected content if authenticated
  return <>{children}</>;
}