'use client';

import { LogOut } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import NavigationTabs from '@/components/NavigationTabs';

export default function ActionsPage() {
  const { currentUser, logout } = useUser();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 relative">
      {/* Navigation tabs - centered at top */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
        <NavigationTabs />
      </div>

      {/* User info and logout - positioned at top right (consistent design) */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        {currentUser && (
          <span className="text-white/80 text-sm font-medium">
            Welcome, {currentUser.display_name}
          </span>
        )}
        <button 
          className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          onClick={logout}
          title="Sign out"
        >
          <LogOut className="w-5 h-5 text-white/60 hover:text-white" strokeWidth={1} />
        </button>
      </div>

      {/* Coming Soon Content */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Actions</h1>
        <p className="text-xl text-white/60 font-geist-sans">Coming Soon</p>
        <p className="text-sm text-white/40 mt-2">This feature is under development</p>
      </div>
    </div>
  );
}