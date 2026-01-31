'use client';

import { useState, useRef, useEffect } from 'react';
import { Users, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function UserSelector() {
  const { currentUser, users, setCurrentUser, isLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserSelect = (user: typeof users[0]) => {
    setCurrentUser(user);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="p-2 opacity-50">
        <Users className="w-6 h-6 text-white/60" strokeWidth={1} />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        title={currentUser ? `Logged in as ${currentUser.display_name}` : 'Select user'}
      >
        <Users className="w-6 h-6 text-white/60 hover:text-white" strokeWidth={1} />
        {currentUser && (
          <span className="text-white/80 text-sm font-medium">
            {currentUser.display_name}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl min-w-[150px] z-50">
          <div className="py-2">
            {users.map((user) => (
              <button
                key={user._id}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 transition-colors duration-200 flex items-center justify-between"
                onClick={() => handleUserSelect(user)}
              >
                <span>{user.display_name}</span>
                {currentUser?._id === user._id && (
                  <Check className="w-4 h-4 text-green-500" strokeWidth={2} />
                )}
              </button>
            ))}
            
            {users.length === 0 && (
              <div className="px-4 py-2 text-gray-400 text-sm">
                No users available
              </div>
            )}
            
            <hr className="border-gray-700 my-2" />
            
            <button
              className="w-full px-4 py-2 text-left text-gray-400 hover:bg-gray-800 transition-colors duration-200 text-sm"
              onClick={() => setCurrentUser(null)}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}