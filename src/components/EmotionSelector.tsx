'use client';

import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Smile, Frown, Angry, Heart, Meh, Laugh, Zap, Coffee, ArrowUpRight } from 'lucide-react';

const emotions = [
  { icon: Smile, name: 'happy', label: 'Happy' },
  { icon: Frown, name: 'sad', label: 'Sad' },
  { icon: Angry, name: 'angry', label: 'Angry' },
  { icon: Heart, name: 'love', label: 'Love' },
  { icon: Meh, name: 'neutral', label: 'Neutral' },
  { icon: Laugh, name: 'excited', label: 'Excited' },
  { icon: Zap, name: 'energetic', label: 'Energetic' },
  { icon: Coffee, name: 'tired', label: 'Tired' },
];

interface EmotionSelectorProps {
  onEmotionSelect: (emotion: string) => void;
  disabled?: boolean;
}

export default function EmotionSelector({ onEmotionSelect, disabled }: EmotionSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleEmotionSelect = (emotionName: string) => {
    onEmotionSelect(emotionName);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          aria-label={disabled ? "User not available" : "Add emotion update"}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          disabled={disabled}
        >
          <ArrowUpRight
            className={`size-6 ${disabled ? 'text-white/30' : 'text-white/60 hover:text-white'}`}
            strokeWidth={1}
            aria-hidden="true"
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          side="top"
          sideOffset={8}
          align="start"
        >
          <div className="relative">
            <div className="bg-[#e71d36] rounded-xl p-6 shadow-xl">
              <div className="grid grid-cols-4 gap-1 w-64" role="group" aria-label="Select an emotion">
                {emotions.map(({ icon: Icon, name, label }) => (
                  <button
                    key={name}
                    onClick={() => handleEmotionSelect(name)}
                    aria-label={label}
                    className="emotion-button flex flex-col items-center p-3 rounded-lg group outline-none focus:bg-white/20"
                  >
                    <Icon
                      className="size-5 text-white transition-colors duration-150"
                      strokeWidth={1.2}
                      aria-hidden="true"
                    />
                    <span className="text-xs text-white mt-1.5 font-light tracking-wide">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Popover.Arrow className="fill-[#e71d36]" width={12} height={6} />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
