import { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import type { User } from '../../types';

interface UserProfileProps {
  user: User;
  onLogoutClick: () => void;
}

export function UserProfile({ user, onLogoutClick }: UserProfileProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {getUserInitials(user.name)}
        </div>
        <span className="text-sm font-medium text-gray-700">{user.name}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>
      
      {/* User Dropdown */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {getUserInitials(user.name)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">Level: {user.role}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                setShowDropdown(false);
                onLogoutClick();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}