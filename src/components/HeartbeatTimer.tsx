'use client';

import { Heart, MessageCircleMore, LogOut } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import { usePersistedUpdates } from '@/hooks/usePersistedUpdates';
import { useUser } from '@/contexts/UserContext';
import UpdatesPanel from './UpdatesPanel';
import EmotionSelector from './EmotionSelector';
import NavigationTabs from './NavigationTabs';
import { useRef, useCallback } from 'react';

const emotionMessages = {
  happy: "Feeling joyful and bright ✨",
  sad: "Navigating through blue moments",
  angry: "Red Ross!",
  love: "Heart overflowing with affection",
  neutral: "Finding balance.",
  excited: "Energy levels pro max! 🚀",
  energetic: "Got the zoomies ⚡",
  tired: "Sleepy Bunny 🐰"
};

export default function HeartbeatTimer() {
  const { formattedTime } = useTimer();
  const { updates, unreadCount, addUpdate, markAllAsRead } = usePersistedUpdates();
  const { currentUser, logout } = useUser();
  const updatesPanelRef = useRef<{ togglePanel: () => void }>(null);

  const handleEmotionSelect = useCallback((emotion: string) => {
    if (!currentUser) {
      console.warn('User not authenticated');
      return;
    }

    const message = emotionMessages[emotion as keyof typeof emotionMessages] || `Feeling ${emotion}`;
    addUpdate(message, currentUser._id, emotion);
  }, [addUpdate, currentUser]);

  const handlePanelOpen = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return (
    <>
      <div className="min-h-dvh bg-black flex flex-col items-center justify-center gap-8 relative">
        {/* Navigation tabs - centered at top */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
          <NavigationTabs />
        </div>

        {/* User info and logout - positioned at top right (original design) */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          {currentUser && (
            <span className="text-white/80 text-sm font-medium">
              Welcome, {currentUser.display_name}
            </span>
          )}
          <button
            aria-label="Sign out"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            onClick={logout}
          >
            <LogOut className="size-5 text-white/60 hover:text-white" strokeWidth={1} aria-hidden="true" />
          </button>
        </div>

        <div className="relative">
          <Heart
            className="size-24 text-red-500 fill-red-500 animate-heartbeat"
            strokeWidth={1}
            aria-hidden="true"
          />
        </div>

        <div className="font-courier-prime text-2xl text-white tracking-wider tabular-nums text-center">
          {formattedTime}
        </div>

        <div className="flex gap-4">
          <EmotionSelector
            onEmotionSelect={handleEmotionSelect}
            disabled={!currentUser}
          />
          <button
            aria-label={`View updates${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 relative"
            onClick={() => updatesPanelRef.current?.togglePanel()}
          >
            <MessageCircleMore className="size-6 text-white/60 hover:text-white" strokeWidth={1} aria-hidden="true" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full size-5 flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </button>
        </div>
      </div>


      <UpdatesPanel ref={updatesPanelRef} updates={updates} onPanelOpen={handlePanelOpen} />
    </>
  );
}
