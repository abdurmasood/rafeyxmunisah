'use client';

import { Heart, ArrowUpRight, MessageCircleMore } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import { usePersistedUpdates } from '@/hooks/usePersistedUpdates';
import UpdatesPanel from './UpdatesPanel';
import EmotionSelector from './EmotionSelector';
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
  const updatesPanelRef = useRef<{ togglePanel: () => void }>(null);
  const emotionSelectorRef = useRef<{ togglePopup: () => void }>(null);

  const handleEmotionSelect = useCallback((emotion: string) => {
    const message = emotionMessages[emotion as keyof typeof emotionMessages] || `Feeling ${emotion}`;
    addUpdate(message);
  }, [addUpdate]);

  const handlePanelOpen = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return (
    <>
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <Heart 
            className="w-24 h-24 text-red-500 fill-red-500 animate-heartbeat" 
            strokeWidth={1}
          />
        </div>
        
        <div className="font-courier-prime text-2xl text-white tracking-wider">
          {formattedTime}
        </div>
        
        <div className="flex gap-4 relative">
          <button 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            onClick={() => emotionSelectorRef.current?.togglePopup()}
          >
            <ArrowUpRight className="w-6 h-6 text-white/60 hover:text-white" strokeWidth={1} />
          </button>
          <button 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 relative"
            onClick={() => updatesPanelRef.current?.togglePanel()}
          >
            <MessageCircleMore className="w-6 h-6 text-white/60 hover:text-white" strokeWidth={1} />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </button>
          <EmotionSelector ref={emotionSelectorRef} onEmotionSelect={handleEmotionSelect} />
        </div>
      </div>
      
      
      <UpdatesPanel ref={updatesPanelRef} updates={updates} onPanelOpen={handlePanelOpen} />
    </>
  );
}