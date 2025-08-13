'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Heart } from 'lucide-react';

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Heart className="w-12 h-12 text-red-500 fill-red-500 animate-heartbeat" strokeWidth={1} />
      </div>
    );
  }

  // Show login page if on login route or not authenticated
  if (pathname === '/login' || !isAuthenticated) {
    return <>{children}</>;
  }

  // Show protected content if authenticated
  return <>{children}</>;
}