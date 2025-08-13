'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import type { UpdateWithUser } from '@/hooks/usePersistedUpdates';

// Removed unused interface - using UpdateWithUser instead

interface UpdatesPanelProps {
  updates: UpdateWithUser[];
  onPanelOpen?: () => void;
}

const UpdatesPanel = forwardRef<{ togglePanel: () => void }, UpdatesPanelProps>(({ updates = [], onPanelOpen }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const togglePanel = () => {
    if (!isOpen && onPanelOpen) {
      onPanelOpen();
    }
    setIsOpen(!isOpen);
  };

  useImperativeHandle(ref, () => ({
    togglePanel
  }));

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>

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
          <div className="flex-1 overflow-y-auto updates-panel-scrollbar">
            <div className="px-8 space-y-6">
              {updates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#ffffff]/60 text-sm">No updates yet</p>
                  <p className="text-[#ffffff]/40 text-xs mt-2">Select an emotion to create an update</p>
                </div>
              ) : (
                updates.map((update, index) => (
                  <div key={update.id} className="group">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-[#ffffff]/80 font-mono tracking-wide">
                        {update.timestamp}
                      </span>
                      <span className="text-xs text-[#ffffff]/60 font-medium px-2 py-1 rounded-full bg-[#ffffff]/10">
                        {update.users?.display_name || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-[#ffffff] leading-relaxed">
                      {update.content}
                    </p>
                    {index < updates.length - 1 && (
                      <div className="w-full h-px bg-[#ffffff]/10 mt-6" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Minimal Footer */}
          <div className="px-8 py-6">
            <div className="w-full h-px bg-[#ffffff]/10 mb-4" />
            <p className="text-xs text-[#ffffff]/80 font-mono">
              Live • {currentTime}
            </p>
          </div>
        </div>
      </div>
    </>
  );
});

UpdatesPanel.displayName = 'UpdatesPanel';

export default UpdatesPanel;