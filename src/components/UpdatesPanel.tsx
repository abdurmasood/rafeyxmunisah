'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface Update {
  id: number;
  timestamp: string;
  content: string;
}

const sampleUpdates: Update[] = [
  {
    id: 1,
    timestamp: '2:32 PM',
    content: 'Heartbeat synchronized perfectly'
  },
  {
    id: 2,
    timestamp: '2:28 PM', 
    content: 'Timer precision calibrated to microseconds'
  },
  {
    id: 3,
    timestamp: '2:15 PM',
    content: 'Love meter: Infinite connection detected'
  },
  {
    id: 4,
    timestamp: '2:10 PM',
    content: 'Anniversary mode activated'
  },
  {
    id: 5,
    timestamp: '2:05 PM',
    content: 'Romantic display initialized'
  }
];

export default function UpdatesPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Invisible Trigger */}
      <div
        className="fixed top-0 right-0 w-8 h-full z-50 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={togglePanel}
      >
        <div 
          className="absolute top-1/2 -translate-y-1/2 right-2"
        >
          <ChevronLeft className={`w-5 h-5 transition-all duration-300 ${
            isHovered ? 'text-red-400' : 'text-[#ffffff]/70'
          } ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Updates Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#e71d36] shadow-2xl z-40 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-2xl font-light text-[#ffffff] tracking-tight">Updates</h2>
            <p className="text-sm text-[#ffffff]/60 mt-1">Latest heartbeat events</p>
          </div>

          {/* Updates List */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-8 space-y-6">
              {sampleUpdates.map((update, index) => (
                <div key={update.id} className="group">
                  <div className="mb-2">
                    <span className="text-xs text-[#ffffff]/80 font-mono tracking-wide">
                      {update.timestamp}
                    </span>
                  </div>
                  <p className="text-[#ffffff] leading-relaxed">
                    {update.content}
                  </p>
                  {index < sampleUpdates.length - 1 && (
                    <div className="w-full h-px bg-[#ffffff]/10 mt-6" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Minimal Footer */}
          <div className="px-8 py-6">
            <div className="w-full h-px bg-[#ffffff]/10 mb-4" />
            <p className="text-xs text-[#ffffff]/80 font-mono">
              Live • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}