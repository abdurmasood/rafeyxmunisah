'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Update as SupabaseUpdate, User } from '@/lib/supabase';

// Local interface for backward compatibility
interface LocalUpdate {
  id: number;
  timestamp: string;
  content: string;
  isRead: boolean;
}

// Extended interface for Supabase updates
export interface UpdateWithUser extends SupabaseUpdate {
  users: User;
}

const STORAGE_KEY = 'heartbeat-updates';
const MAX_UPDATES = 100;

export function usePersistedUpdates() {
  const [updates, setUpdates] = useState<UpdateWithUser[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load updates from Supabase on mount
  useEffect(() => {
    const loadUpdates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/updates');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load updates');
        }
        
        setUpdates(data.updates || []);
        setUnreadCount(data.updates?.filter((update: UpdateWithUser) => !update.is_read).length || 0);
        
        // Backup to localStorage for offline access
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.updates || []));
        } catch (localStorageError) {
          console.warn('Failed to backup to localStorage:', localStorageError);
        }
      } catch (error) {
        console.error('Failed to load updates from Supabase:', error);
        setError(error instanceof Error ? error.message : 'Failed to load updates');
        
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsedUpdates: LocalUpdate[] = JSON.parse(stored);
            // Convert local updates to the new format for compatibility
            const convertedUpdates = parsedUpdates.map(update => ({
              id: update.id.toString(),
              user_id: 'local-user',
              content: update.content,
              emotion_type: 'neutral',
              timestamp: update.timestamp,
              is_read: update.isRead,
              created_at: new Date().toISOString(),
              users: {
                id: 'local-user',
                name: 'local',
                display_name: 'You',
                created_at: new Date().toISOString()
              }
            }));
            setUpdates(convertedUpdates as UpdateWithUser[]);
            setUnreadCount(convertedUpdates.filter(update => !update.is_read).length);
          }
        } catch (localError) {
          console.error('Failed to load from localStorage backup:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUpdates();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'updates'
      }, (payload) => {
        // Fetch the complete update with user data
        const fetchNewUpdate = async () => {
          try {
            const { data, error } = await supabase
              .from('updates')
              .select(`
                *,
                users (
                  id,
                  name,
                  display_name
                )
              `)
              .eq('id', payload.new.id)
              .single();
              
            if (!error && data) {
              setUpdates(prev => [data as UpdateWithUser, ...prev.slice(0, MAX_UPDATES - 1)]);
              setUnreadCount(prev => prev + 1);
            }
          } catch (error) {
            console.error('Failed to fetch new update:', error);
          }
        };
        
        fetchNewUpdate();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addUpdate = useCallback(async (content: string, userId?: string, emotionType?: string) => {
    try {
      // Use default user if none provided (will need user context later)
      const user_id = userId || 'local-user';
      const emotion_type = emotionType || 'neutral';
      
      const response = await fetch('/api/updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          content,
          emotion_type
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add update');
      }
      
      // The real-time subscription will handle adding the update to the state
      // But we can also add it optimistically for better UX
      if (data.update) {
        setUpdates(prev => [data.update, ...prev.slice(0, MAX_UPDATES - 1)]);
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to add update:', error);
      setError(error instanceof Error ? error.message : 'Failed to add update');
      
      // Fallback to local storage for offline support
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const localUpdate: UpdateWithUser = {
        id: Date.now().toString(),
        user_id: 'local-user',
        content,
        emotion_type: emotionType || 'neutral',
        timestamp,
        is_read: false,
        created_at: now.toISOString(),
        users: {
          id: 'local-user',
          name: 'local',
          display_name: 'You',
          created_at: now.toISOString()
        }
      };
      
      setUpdates(prev => [localUpdate, ...prev.slice(0, MAX_UPDATES - 1)]);
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadUpdateIds = updates
        .filter(update => !update.is_read)
        .map(update => update.id);
        
      if (unreadUpdateIds.length === 0) return;
      
      const response = await fetch('/api/updates', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updateIds: unreadUpdateIds,
          markAsRead: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark updates as read');
      }
      
      // Update local state
      setUpdates(prev => prev.map(update => ({ ...update, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark updates as read:', error);
      // Still update local state for better UX
      setUpdates(prev => prev.map(update => ({ ...update, is_read: true })));
      setUnreadCount(0);
    }
  }, [updates]);

  const clearAllUpdates = useCallback(async () => {
    try {
      // For now, just clear local state - implement server-side deletion if needed
      setUpdates([]);
      setUnreadCount(0);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear updates:', error);
    }
  }, []);

  return {
    updates,
    unreadCount,
    isLoading,
    error,
    addUpdate,
    markAllAsRead,
    clearAllUpdates
  };
}