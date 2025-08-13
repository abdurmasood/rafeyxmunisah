'use client';

import { useState, forwardRef, useImperativeHandle, useEffect, useRef, useCallback } from 'react';
import { Smile, Frown, Angry, Heart, Meh, Laugh, Zap } from 'lucide-react';

const emotions = [
  { icon: Smile, name: 'happy', label: 'Happy' },
  { icon: Frown, name: 'sad', label: 'Sad' },
  { icon: Angry, name: 'angry', label: 'Angry' },
  { icon: Heart, name: 'love', label: 'Love' },
  { icon: Meh, name: 'neutral', label: 'Neutral' },
  { icon: Laugh, name: 'excited', label: 'Excited' },
  { icon: Zap, name: 'energetic', label: 'Energetic' },
];

const EmotionSelector = forwardRef<{ togglePopup: () => void }>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const cloudRef = useRef<HTMLDivElement>(null);

  const togglePopup = useCallback(() => {
    if (isOpen) {
      setIsExiting(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsExiting(false);
      }, 150);
    } else {
      setIsOpen(true);
    }
  }, [isOpen]);

  useImperativeHandle(ref, () => ({
    togglePopup
  }));

  const handleEmotionSelect = (emotionName: string) => {
    console.log(`Selected emotion: ${emotionName}`);
    togglePopup();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cloudRef.current && !cloudRef.current.contains(event.target as Node)) {
        if (isOpen && !isExiting) {
          togglePopup();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isExiting, togglePopup]);

  if (!isOpen) return null;

  return (
    <div 
      ref={cloudRef}
      className={`absolute bottom-full left-0 mb-2 z-50 ${
        isExiting ? 'animate-cloud-exit' : 'animate-cloud-enter'
      }`}
    >
      {/* Elegant cloud */}
      <div className="relative">
        <div className="bg-black/95 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl will-change-transform">
          <div className="grid grid-cols-4 gap-1 w-64">
            {emotions.map(({ icon: Icon, name, label }) => (
              <button
                key={name}
                onClick={() => handleEmotionSelect(name)}
                className="emotion-button flex flex-col items-center p-3 rounded-lg group"
                title={label}
              >
                <Icon 
                  className="w-5 h-5 text-white/60 group-hover:text-white/90 transition-colors duration-200" 
                  strokeWidth={1.2}
                />
                <span className="text-xs text-white/40 group-hover:text-white/70 mt-1.5 font-light tracking-wide">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Minimal pointer */}
        <div className="absolute top-full left-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white/10"></div>
        <div className="absolute top-full left-6 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-black/95 translate-y-[-1px]"></div>
      </div>
    </div>
  );
});

EmotionSelector.displayName = 'EmotionSelector';

export default EmotionSelector;