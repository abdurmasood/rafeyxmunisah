import { query, action, internalQuery } from "./_generated/server";
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
