"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getSession, clearSession, createSession } from "@/lib/auth";
import { Id } from "../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  display_name: string;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setCurrentUser: (user: User | null) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from Convex (real-time)
  const usersData = useQuery(api.users.getUsers);
  const users = (usersData ?? []) as User[];

  // Login action
  const loginAction = useAction(api.users.login);

  // Check session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const session = getSession();
        if (session && usersData) {
          const userExists = usersData.find(
            (u) => u._id === session.userId
          );
          if (userExists) {
            setCurrentUserState(userExists as User);
            setIsAuthenticated(true);
          } else {
            clearSession();
            setIsAuthenticated(false);
          }
        } else if (!session) {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Session check error:", err);
        clearSession();
        setIsAuthenticated(false);
      } finally {
        if (usersData !== undefined) {
          setIsLoading(false);
        }
      }
    };

    checkSession();
  }, [usersData]);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
  };

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);

      const result = await loginAction({ username, password });

      if (result.success && result.user) {
        const user: User = {
          _id: result.user._id as Id<"users">,
          name: result.user.name,
          display_name: result.user.display_name,
        };
        setCurrentUserState(user);
        setIsAuthenticated(true);

        // Create session with adapted user object
        createSession({
          id: user._id,
          name: user.name,
          display_name: user.display_name,
        });

        return { success: true };
      } else {
        return { success: false, error: result.error || "Login failed" };
      }
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    setCurrentUserState(null);
    setIsAuthenticated(false);
    clearSession();
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        isLoading,
        isAuthenticated,
        error,
        setCurrentUser,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
