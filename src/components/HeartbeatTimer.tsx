'use client';

import { Heart, ArrowUpRight, MessageCircleMore } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import UpdatesPanel from './UpdatesPanel';
import EmotionSelector from './EmotionSelector';
import { useRef } from 'react';

export default function HeartbeatTimer() {
  const { formattedTime } = useTimer();
  const updatesPanelRef = useRef<{ togglePanel: () => void }>(null);
  const emotionSelectorRef = useRef<{ togglePopup: () => void }>(null);

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
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            onClick={() => updatesPanelRef.current?.togglePanel()}
          >
            <MessageCircleMore className="w-6 h-6 text-white/60 hover:text-white" strokeWidth={1} />
          </button>
          <EmotionSelector ref={emotionSelectorRef} />
        </div>
      </div>
      
      
      <UpdatesPanel ref={updatesPanelRef} />
    </>
  );
}