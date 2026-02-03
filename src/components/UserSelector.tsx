'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Users, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function UserSelector() {
  const { currentUser, users, setCurrentUser, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="p-2 opacity-50">
        <Users className="size-6 text-white/60" strokeWidth={1} aria-hidden="true" />
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={currentUser ? `Logged in as ${currentUser.display_name}` : 'Select user'}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <Users className="size-6 text-white/60 hover:text-white" strokeWidth={1} aria-hidden="true" />
          {currentUser && (
            <span className="text-white/80 text-sm font-medium">
              {currentUser.display_name}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl min-w-[150px] z-50 py-2 animate-in fade-in-0 zoom-in-95"
          sideOffset={8}
          align="end"
        >
          {users.map((user) => (
            <DropdownMenu.Item
              key={user._id}
              className="px-4 py-2 text-white hover:bg-gray-800 transition-colors duration-200 flex items-center justify-between cursor-pointer outline-none focus:bg-gray-800"
              onSelect={() => setCurrentUser(user)}
            >
              <span>{user.display_name}</span>
              {currentUser?._id === user._id && (
                <Check className="size-4 text-green-500" strokeWidth={2} aria-hidden="true" />
              )}
            </DropdownMenu.Item>
          ))}

          {users.length === 0 && (
            <div className="px-4 py-2 text-gray-400 text-sm text-pretty">
              No users available
            </div>
          )}

          <DropdownMenu.Separator className="h-px bg-gray-700 my-2" />

          <DropdownMenu.Item
            className="px-4 py-2 text-gray-400 hover:bg-gray-800 transition-colors duration-200 text-sm cursor-pointer outline-none focus:bg-gray-800"
            onSelect={() => setCurrentUser(null)}
          >
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
