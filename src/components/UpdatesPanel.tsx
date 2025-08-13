'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Update {
  id: number;
  timestamp: string;
  content: string;
  type: 'info' | 'success' | 'warning';
}

const sampleUpdates: Update[] = [
  {
    id: 1,
    timestamp: '14:32',
    content: 'Heartbeat synchronized perfectly',
    type: 'success'
  },
  {
    id: 2,
    timestamp: '14:28',
    content: 'Timer precision calibrated to microseconds',
    type: 'info'
  },
  {
    id: 3,
    timestamp: '14:15',
    content: 'Love meter: Infinite connection detected',
    type: 'success'
  },
  {
    id: 4,
    timestamp: '14:10',
    content: 'Anniversary mode activated',
    type: 'info'
  },
  {
    id: 5,
    timestamp: '14:05',
    content: 'Romantic display initialized',
    type: 'info'
  }
];

export default function UpdatesPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const getUpdateColor = (type: Update['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-red-400';
      case 'info':
      default:
        return 'text-white/80';
    }
  };

  const getStatusDotColor = (type: Update['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-400';
      case 'warning':
        return 'bg-red-400';
      case 'info':
      default:
        return 'bg-red-500';
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={togglePanel}
        />
      )}

      {/* Trigger Arrow */}
      <button
        onClick={togglePanel}
        className={`fixed top-1/2 -translate-y-1/2 z-50 bg-black/90 border border-white/20 rounded-l-lg p-3 transition-all duration-300 hover:bg-black hover:border-red-500/50 group ${
          isOpen ? 'right-80' : 'right-0'
        }`}
        aria-label={isOpen ? 'Close updates panel' : 'Open updates panel'}
      >
        {isOpen ? (
          <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-red-400 transition-colors" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-white/60 group-hover:text-red-400 transition-colors" />
        )}
      </button>

      {/* Updates Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-black/95 border-l border-white/10 z-50 transition-transform duration-300 ease-out backdrop-blur-sm ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-medium text-white">Updates</h2>
            <p className="text-sm text-white/60">Latest heartbeat events</p>
          </div>

          {/* Updates List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {sampleUpdates.map((update) => (
                <div 
                  key={update.id}
                  className="p-3 rounded-lg bg-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-courier-prime text-xs text-white/60">
                      {update.timestamp}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getStatusDotColor(update.type)} animate-pulse`} />
                  </div>
                  <p className={`text-sm ${getUpdateColor(update.type)}`}>
                    {update.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/10">
            <p className="text-xs text-white/60 font-courier-prime">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}