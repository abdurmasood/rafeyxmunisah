"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  display_name: string;
}

export interface UpdateWithUser {
  _id: Id<"updates">;
  user_id: Id<"users">;
  content: string;
  emotion_type: string;
  timestamp: string;
  is_read: boolean;
  _creationTime: number;
  users: User | null;
}

export function usePersistedUpdates() {
  // Real-time updates from Convex
  const updatesData = useQuery(api.updates.list);
  const createMutation = useMutation(api.updates.create);
  const markAsReadMutation = useMutation(api.updates.markAsRead);

  const updates = (updatesData ?? []) as UpdateWithUser[];
  const isLoading = updatesData === undefined;
  const unreadCount = updates.filter((u) => !u.is_read).length;

  const addUpdate = async (
    content: string,
    userId?: string,
    emotionType?: string
  ) => {
    if (!userId) {
      console.error("User ID required to add update");
      return;
    }

    try {
      await createMutation({
        user_id: userId as Id<"users">,
        content,
        emotion_type: emotionType || "neutral",
      });
    } catch (error) {
      console.error("Failed to add update:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = updates
      .filter((u) => !u.is_read)
      .map((u) => u._id);

    if (unreadIds.length === 0) return;

    try {
      await markAsReadMutation({ updateIds: unreadIds });
    } catch (error) {
      console.error("Failed to mark updates as read:", error);
    }
  };

  const clearAllUpdates = async () => {
    // Not implementing server-side delete for now
    console.warn("Clear all updates not implemented");
  };

  return {
    updates,
    unreadCount,
    isLoading,
    error: null,
    addUpdate,
    markAllAsRead,
    clearAllUpdates,
  };
}
