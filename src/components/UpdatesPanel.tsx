'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Update {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'feature' | 'announcement';
}

const sampleUpdates: Update[] = [
  {
    id: '1',
    timestamp: new Date('2024-08-10T14:30:00'),
    message: 'Added microsecond precision to the timer for even more accurate timing',
    type: 'feature'
  },
  {
    id: '2',
    timestamp: new Date('2024-08-08T09:15:00'),
    message: 'Welcome to our heartbeat timer! This shows the time since we began our journey together.',
    type: 'announcement'
  },
  {
    id: '3',
    timestamp: new Date('2024-08-05T18:45:00'),
    message: 'The heart animation now perfectly syncs with our love story.',
    type: 'info'
  }
];

export default function UpdatesPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUpdateIcon = (type: Update['type']) => {
    switch (type) {
      case 'feature':
        return '•';
      case 'announcement':
        return '•';
      case 'info':
        return '•';
      default:
        return '•';
    }
  };

  return (
    <>
      {/* Trigger Arrow */}
      <div 
        className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 cursor-pointer ${
          isOpen ? 'right-80' : 'right-0'
        }`}
        onClick={togglePanel}
      >
        <div className="p-2 opacity-60 hover:opacity-90">
          {isOpen ? (
            <ChevronRight className="w-6 h-6 text-gray-300" />
          ) : (
            <ChevronLeft className="w-6 h-6 text-gray-300 animate-pulse" />
          )}
        </div>
      </div>

      {/* Updates Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-black border-l border-gray-800 z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-800 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-white">Updates</h2>
            <p className="text-gray-400 text-sm mt-1">Latest news from our journey</p>
          </div>

          {/* Updates List */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {sampleUpdates.map((update) => (
              <div key={update.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{getUpdateIcon(update.type)}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm leading-relaxed">{update.message}</p>
                    <div className="mt-2 text-xs text-gray-500 font-courier-prime">
                      {formatTimestamp(update.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 pt-4 mt-6">
            <p className="text-gray-500 text-xs text-center">
              All updates are crafted with love
            </p>
          </div>
        </div>
      </div>

    </>
  );
}