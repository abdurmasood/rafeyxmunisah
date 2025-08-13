'use client';

import { Heart, Rabbit, Cat, Dog, Panda } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import UpdatesPanel from './UpdatesPanel';

export default function HeartbeatTimer() {
  const { formattedTime } = useTimer();

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
      </div>
      
      {/* Animal icons in corners */}
      <div className="fixed top-4 left-4 z-30">
        <Dog className="w-6 h-6 text-white/60" strokeWidth={1} />
      </div>
      
      <div className="fixed top-4 right-4 z-30">
        <Cat className="w-6 h-6 text-white/60" strokeWidth={1} />
      </div>
      
      <div className="fixed bottom-4 left-4 z-30">
        <Panda className="w-6 h-6 text-white/60" strokeWidth={1} />
      </div>
      
      <div className="fixed bottom-4 right-4 z-30">
        <Rabbit className="w-6 h-6 text-white/60" strokeWidth={1} />
      </div>
      
      <UpdatesPanel />
    </>
  );
}