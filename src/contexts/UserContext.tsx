'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/supabase';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'heartbeat-current-user';

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load users and current user on mount
  useEffect(() => {
    const initializeUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch users from API
        const response = await fetch('/api/users');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load users');
        }
        
        setUsers(data.users || []);
        
        // Try to restore current user from localStorage
        try {
          const storedUser = localStorage.getItem(USER_STORAGE_KEY);
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Verify the user still exists
            const userExists = data.users.find((u: User) => u.id === parsedUser.id);
            if (userExists) {
              setCurrentUserState(parsedUser);
            } else {
              localStorage.removeItem(USER_STORAGE_KEY);
            }
          }
        } catch (localError) {
          console.warn('Failed to restore user from localStorage:', localError);
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to initialize users:', error);
        setError(error instanceof Error ? error.message : 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeUsers();
  }, []);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    
    // Persist to localStorage
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to persist user to localStorage:', error);
    }
  };

  const refreshUsers = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh users');
      }
      
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to refresh users:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh users');
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      isLoading,
      error,
      setCurrentUser,
      refreshUsers
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}