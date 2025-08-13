'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/lib/supabase';
import { getSession, clearSession, createSession } from '@/lib/auth';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load users and check authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check for existing session
        const session = getSession();
        if (session) {
          // Verify session is still valid and user exists
          const response = await fetch('/api/users');
          const data = await response.json();
          
          if (response.ok && data.users) {
            setUsers(data.users || []);
            const userExists = data.users.find((u: User) => u.id === session.userId);
            if (userExists) {
              setCurrentUserState(userExists);
              setIsAuthenticated(true);
            } else {
              // User no longer exists, clear session
              clearSession();
              setIsAuthenticated(false);
            }
          } else {
            // API error, clear session to be safe
            clearSession();
            setIsAuthenticated(false);
          }
        } else {
          // No session, not authenticated
          setIsAuthenticated(false);
          
          // Still fetch users list for login purposes
          try {
            const response = await fetch('/api/users');
            const data = await response.json();
            if (response.ok) {
              setUsers(data.users || []);
            }
          } catch (userError) {
            console.warn('Failed to fetch users:', userError);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize');
        setIsAuthenticated(false);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    // Note: For authenticated app, user setting is handled by login/logout
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const user: User = data.user;
        setCurrentUserState(user);
        setIsAuthenticated(true);
        
        // Create session
        createSession(user);
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setCurrentUserState(null);
    setIsAuthenticated(false);
    clearSession();
    
    // Optionally call logout API
    fetch('/api/auth/logout', { method: 'POST' }).catch(console.warn);
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
      isAuthenticated,
      error,
      setCurrentUser,
      login,
      logout,
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