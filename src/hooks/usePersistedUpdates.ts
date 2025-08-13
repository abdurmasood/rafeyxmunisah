'use client';

import { useState, useEffect, useCallback } from 'react';

interface Update {
  id: number;
  timestamp: string;
  content: string;
  isRead: boolean;
}

const STORAGE_KEY = 'heartbeat-updates';
const MAX_UPDATES = 100; // Keep only the 100 most recent updates to prevent slowdown

export function usePersistedUpdates() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load updates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedUpdates: Update[] = JSON.parse(stored);
        // Ensure we don't load too many updates
        const recentUpdates = parsedUpdates.slice(0, MAX_UPDATES);
        setUpdates(recentUpdates);
        setUnreadCount(recentUpdates.filter(update => !update.isRead).length);
      }
    } catch (error) {
      console.error('Failed to load updates from localStorage:', error);
    }
  }, []);

  // Save updates to localStorage whenever updates change
  useEffect(() => {
    if (updates.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
      } catch (error) {
        console.error('Failed to save updates to localStorage:', error);
      }
    }
  }, [updates]);

  const addUpdate = useCallback((content: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newUpdate: Update = {
      id: Date.now(),
      timestamp,
      content,
      isRead: false
    };

    setUpdates(prevUpdates => {
      const updatedList = [newUpdate, ...prevUpdates];
      // Keep only the most recent MAX_UPDATES to prevent performance issues
      return updatedList.slice(0, MAX_UPDATES);
    });
    
    setUnreadCount(prevCount => prevCount + 1);
  }, []);

  const markAllAsRead = useCallback(() => {
    setUpdates(prevUpdates => 
      prevUpdates.map(update => ({ ...update, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearAllUpdates = useCallback(() => {
    setUpdates([]);
    setUnreadCount(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    updates,
    unreadCount,
    addUpdate,
    markAllAsRead,
    clearAllUpdates
  };
}