// Use globalThis.crypto for both Node.js and browser compatibility
const crypto = globalThis.crypto || (typeof window !== 'undefined' ? window.crypto : null);

// Password strength validation
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  return { isValid: true };
}

// Hash password using Web Crypto API (available in Node.js and browsers)
export async function hashPassword(password: string): Promise<string> {
  if (!crypto) {
    throw new Error('Web Crypto API not available');
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Import password as key
  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256 // 32 bytes
  );
  
  // Combine salt and derived bits
  const hashArray = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt, 0);
  combined.set(hashArray, salt.length);
  
  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    if (!crypto) {
      throw new Error('Web Crypto API not available');
    }
    
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Decode the hash
    const combined = Uint8Array.from(atob(hash), c => c.charCodeAt(0));
    
    // Extract salt (first 16 bytes) and hash (remaining bytes)
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);
    
    // Import password as key
    const key = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive key using the same parameters
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
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
    console.error('Password verification error:', error);
    return false;
  }
}

// Generate a secure session token
export function generateSessionToken(): string {
  if (!crypto) {
    throw new Error('Web Crypto API not available');
  }
  
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Session management
export interface UserSession {
  userId: string;
  username: string;
  displayName: string;
  token: string;
  expiresAt: number;
}

const SESSION_STORAGE_KEY = 'heartbeat-session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createSession(user: { id: string; name: string; display_name: string }): UserSession {
  const session: UserSession = {
    userId: user.id,
    username: user.name,
    displayName: user.display_name,
    token: generateSessionToken(),
    expiresAt: Date.now() + SESSION_DURATION
  };
  
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.warn('Failed to store session:', error);
  }
  
  return session;
}

export function getSession(): UserSession | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    
    const session: UserSession = JSON.parse(stored);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.warn('Failed to get session:', error);
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear session:', error);
  }
}

export function isSessionValid(): boolean {
  const session = getSession();
  return session !== null;
}