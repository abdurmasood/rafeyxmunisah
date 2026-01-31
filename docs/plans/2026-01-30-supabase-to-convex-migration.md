# Supabase to Convex Migration

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Supabase backend with Convex for simpler real-time data sync.

**Architecture:** Convex replaces both the database (Supabase) and API routes (Next.js). Queries/mutations defined in `convex/` folder, consumed via `useQuery`/`useMutation` hooks. Auth stays client-side (localStorage sessions) with password verification via Convex action.

**Tech Stack:** Convex, Next.js 15, React 19, TypeScript

---

## Task 1: Install and Initialize Convex

**Files:**
- Create: `convex/` directory (auto-generated)
- Create: `.env.local` (add Convex URL)
- Modify: `package.json` (add convex dependency)

**Step 1: Install Convex**

```bash
npm install convex
```

**Step 2: Initialize Convex project**

```bash
npx convex dev
```

This will:
- Prompt for GitHub auth (one-time)
- Create a new Convex project
- Generate `convex/` folder with `_generated/` types
- Add `NEXT_PUBLIC_CONVEX_URL` to `.env.local`

**Step 3: Verify setup**

Check that these files exist:
- `convex/_generated/api.d.ts`
- `convex/_generated/server.d.ts`
- `.env.local` contains `NEXT_PUBLIC_CONVEX_URL=https://...`

**Step 4: Commit**

```bash
git add package.json package-lock.json convex/ .env.local
git commit -m "chore: install and initialize convex"
```

---

## Task 2: Create Convex Schema

**Files:**
- Create: `convex/schema.ts`

**Step 1: Create the schema file**

Create `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    display_name: v.string(),
    password_hash: v.string(),
  }).index("by_name", ["name"]),

  updates: defineTable({
    user_id: v.id("users"),
    content: v.string(),
    emotion_type: v.string(),
    timestamp: v.string(),
    is_read: v.boolean(),
  }).index("by_creation", []),

  heartbeatConfig: defineTable({
    start_date: v.string(),
  }),
});
```

**Step 2: Verify schema deploys**

With `npx convex dev` running, check terminal shows:
```
✓ Schema validated
```

**Step 3: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: add convex schema for users, updates, heartbeatConfig"
```

---

## Task 3: Create Users Queries and Login Action

**Files:**
- Create: `convex/users.ts`

**Step 1: Create users.ts with getUsers query**

Create `convex/users.ts`:

```typescript
import { query, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").order("asc").collect();
    // Return without password_hash
    return users.map(({ password_hash, ...user }) => user);
  },
});

export const getUserByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name.toLowerCase().trim()))
      .first();
    return user;
  },
});

export const login = action({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; user?: { _id: string; name: string; display_name: string }; error?: string }> => {
    // Fetch user with password hash
    const user = await ctx.runQuery(internal.users.getUserWithPassword, {
      name: args.username,
    });

    if (!user) {
      return { success: false, error: "Invalid username or password" };
    }

    // Verify password using Web Crypto API (available in Convex runtime)
    const isValid = await verifyPassword(args.password, user.password_hash);

    if (!isValid) {
      return { success: false, error: "Invalid username or password" };
    }

    return {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        display_name: user.display_name,
      },
    };
  },
});

// Internal query to get user with password (not exposed to client)
import { internalQuery } from "./_generated/server";

export const getUserWithPassword = internalQuery({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name.toLowerCase().trim()))
      .first();
  },
});

// Password verification using Web Crypto API
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // Decode the hash
    const combined = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));

    // Extract salt (first 16 bytes) and hash (remaining bytes)
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);

    // Import password as key
    const key = await crypto.subtle.importKey(
      "raw",
      data,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    // Derive key using the same parameters
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256
    );

    const derivedArray = new Uint8Array(derivedBits);

    // Compare the derived hash with stored hash
    if (derivedArray.length !== storedHash.length) {
      return false;
    }

    for (let i = 0; i < derivedArray.length; i++) {
      if (derivedArray[i] !== storedHash[i]) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}
```

**Step 2: Verify it deploys**

Check `npx convex dev` terminal shows no errors.

**Step 3: Commit**

```bash
git add convex/users.ts
git commit -m "feat: add convex users queries and login action"
```

---

## Task 4: Create Updates Queries and Mutations

**Files:**
- Create: `convex/updates.ts`

**Step 1: Create updates.ts**

Create `convex/updates.ts`:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const updates = await ctx.db
      .query("updates")
      .order("desc")
      .take(100);

    // Fetch user data for each update
    const updatesWithUsers = await Promise.all(
      updates.map(async (update) => {
        const user = await ctx.db.get(update.user_id);
        return {
          ...update,
          users: user
            ? {
                _id: user._id,
                name: user.name,
                display_name: user.display_name,
              }
            : null,
        };
      })
    );

    return updatesWithUsers;
  },
});

export const create = mutation({
  args: {
    user_id: v.id("users"),
    content: v.string(),
    emotion_type: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updateId = await ctx.db.insert("updates", {
      user_id: args.user_id,
      content: args.content,
      emotion_type: args.emotion_type,
      timestamp,
      is_read: false,
    });

    const update = await ctx.db.get(updateId);
    const user = await ctx.db.get(args.user_id);

    return {
      ...update,
      users: user
        ? {
            _id: user._id,
            name: user.name,
            display_name: user.display_name,
          }
        : null,
    };
  },
});

export const markAsRead = mutation({
  args: {
    updateIds: v.array(v.id("updates")),
  },
  handler: async (ctx, args) => {
    for (const id of args.updateIds) {
      await ctx.db.patch(id, { is_read: true });
    }
    return { success: true };
  },
});
```

**Step 2: Verify it deploys**

Check `npx convex dev` terminal shows no errors.

**Step 3: Commit**

```bash
git add convex/updates.ts
git commit -m "feat: add convex updates queries and mutations"
```

---

## Task 5: Create Heartbeat Config Query and Mutation

**Files:**
- Create: `convex/heartbeat.ts`

**Step 1: Create heartbeat.ts**

Create `convex/heartbeat.ts`:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("heartbeatConfig").first();
    return config;
  },
});

export const updateConfig = mutation({
  args: {
    start_date: v.string(),
  },
  handler: async (ctx, args) => {
    const existingConfig = await ctx.db.query("heartbeatConfig").first();

    if (existingConfig) {
      await ctx.db.patch(existingConfig._id, {
        start_date: args.start_date,
      });
      return await ctx.db.get(existingConfig._id);
    } else {
      const id = await ctx.db.insert("heartbeatConfig", {
        start_date: args.start_date,
      });
      return await ctx.db.get(id);
    }
  },
});
```

**Step 2: Verify it deploys**

Check `npx convex dev` terminal shows no errors.

**Step 3: Commit**

```bash
git add convex/heartbeat.ts
git commit -m "feat: add convex heartbeat config query and mutation"
```

---

## Task 6: Create Convex Client Provider

**Files:**
- Create: `src/providers/ConvexClientProvider.tsx`

**Step 1: Create provider component**

Create `src/providers/ConvexClientProvider.tsx`:

```typescript
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

**Step 2: Update layout.tsx to include provider**

Modify `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono, Courier_Prime } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { UserProvider } from "@/contexts/UserContext";
import AuthWrapper from "@/components/AuthWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Rafey x Munisah",
  description: "To Infinity.",
  keywords: ["heartbeat", "timer", "love", "romantic", "anniversary", "countdown"],
  authors: [{ name: "Rafey & Munisah" }],
  creator: "Rafey",
  openGraph: {
    title: "Rafey x Munisah",
    description: "To Infinity.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rafey x Munisah",
    description: "To Infinity.",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${courierPrime.variable} antialiased`}
      >
        <ConvexClientProvider>
          <UserProvider>
            <AuthWrapper>
              {children}
            </AuthWrapper>
          </UserProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

**Step 3: Commit**

```bash
git add src/providers/ConvexClientProvider.tsx src/app/layout.tsx
git commit -m "feat: add ConvexClientProvider and wrap app"
```

---

## Task 7: Update UserContext to Use Convex

**Files:**
- Modify: `src/contexts/UserContext.tsx`

**Step 1: Rewrite UserContext with Convex**

Replace contents of `src/contexts/UserContext.tsx`:

```typescript
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
```

**Step 2: Commit**

```bash
git add src/contexts/UserContext.tsx
git commit -m "refactor: update UserContext to use Convex"
```

---

## Task 8: Update usePersistedUpdates Hook

**Files:**
- Modify: `src/hooks/usePersistedUpdates.ts`

**Step 1: Rewrite hook with Convex**

Replace contents of `src/hooks/usePersistedUpdates.ts`:

```typescript
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
```

**Step 2: Commit**

```bash
git add src/hooks/usePersistedUpdates.ts
git commit -m "refactor: update usePersistedUpdates to use Convex"
```

---

## Task 9: Update Components for New Types

**Files:**
- Modify: `src/components/UpdatesPanel.tsx` (if needed)
- Modify: Any component using old `id` field (now `_id`)

**Step 1: Check UpdatesPanel for type issues**

Read `src/components/UpdatesPanel.tsx` and update any references from:
- `update.id` → `update._id`
- `update.created_at` → `update._creationTime`
- `user.id` → `user._id`

**Step 2: Search for other usages**

```bash
grep -r "\.id" src/components/ --include="*.tsx" | grep -v "_id"
```

Fix any occurrences that reference the old Supabase `id` field.

**Step 3: Commit**

```bash
git add src/components/
git commit -m "fix: update components for Convex types (_id instead of id)"
```

---

## Task 10: Remove Supabase Files and Dependencies

**Files:**
- Delete: `src/lib/supabase.ts`
- Delete: `src/lib/supabase-edge.ts`
- Delete: `src/app/api/auth/login/route.ts`
- Delete: `src/app/api/auth/logout/route.ts`
- Delete: `src/app/api/updates/route.ts`
- Delete: `src/app/api/users/route.ts`
- Delete: `src/app/api/sync/route.ts`
- Delete: `src/app/api/heartbeat/config/route.ts`
- Modify: `package.json` (remove @supabase/supabase-js)

**Step 1: Delete Supabase lib files**

```bash
rm src/lib/supabase.ts src/lib/supabase-edge.ts
```

**Step 2: Delete API routes**

```bash
rm -rf src/app/api/
```

**Step 3: Remove Supabase dependency**

```bash
npm uninstall @supabase/supabase-js
```

**Step 4: Remove Supabase env vars from .env.local**

Edit `.env.local` and remove:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (if present)

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove supabase files and dependencies"
```

---

## Task 11: Seed Initial Data

**Files:**
- Create: `convex/seed.ts` (temporary)

**Step 1: Create seed script**

Create `convex/seed.ts`:

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// One-time seed mutation - run from Convex dashboard
export const seedUsers = mutation({
  args: {
    users: v.array(
      v.object({
        name: v.string(),
        display_name: v.string(),
        password_hash: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const user of args.users) {
      await ctx.db.insert("users", user);
    }
    return { success: true, count: args.users.length };
  },
});

export const seedHeartbeatConfig = mutation({
  args: {
    start_date: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("heartbeatConfig", {
      start_date: args.start_date,
    });
    return { success: true };
  },
});
```

**Step 2: Run seed from Convex dashboard**

1. Go to your Convex dashboard (URL shown in `npx convex dev` output)
2. Navigate to Functions → seed
3. Run `seedUsers` with your existing user data (copy password_hash from Supabase)
4. Run `seedHeartbeatConfig` with your start_date

**Step 3: Verify data in dashboard**

Check Data tab shows users and heartbeatConfig populated.

**Step 4: Delete seed file and commit**

```bash
rm convex/seed.ts
git add -A
git commit -m "chore: seed initial data (seed script removed)"
```

---

## Task 12: Test Full Application

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Test login flow**

1. Navigate to http://localhost:3000
2. Login with existing credentials
3. Verify redirect to home page

**Step 3: Test real-time updates**

1. Open app in two browser windows
2. Send an update from one window
3. Verify it appears instantly in the other window

**Step 4: Test heartbeat timer**

1. Verify timer displays correctly
2. (Optional) Test config update if UI exists

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete supabase to convex migration"
```

---

## Summary

| Before (Supabase) | After (Convex) |
|-------------------|----------------|
| 6 API route files | 3 Convex function files |
| Manual real-time subscriptions | Automatic with `useQuery` |
| ~350 lines in hooks/contexts | ~150 lines |
| Supabase dashboard | Convex dashboard |

**Files Created:**
- `convex/schema.ts`
- `convex/users.ts`
- `convex/updates.ts`
- `convex/heartbeat.ts`
- `src/providers/ConvexClientProvider.tsx`

**Files Deleted:**
- `src/lib/supabase.ts`
- `src/lib/supabase-edge.ts`
- All `src/app/api/` routes

**Files Modified:**
- `src/app/layout.tsx`
- `src/contexts/UserContext.tsx`
- `src/hooks/usePersistedUpdates.ts`
- Components using old types
