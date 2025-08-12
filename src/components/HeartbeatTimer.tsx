'use client';

import { Heart } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';

export default function HeartbeatTimer() {
  const { formattedTime } = useTimer();

  return (
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
  );
}