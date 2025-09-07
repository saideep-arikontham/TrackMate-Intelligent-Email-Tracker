import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, Settings, LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  const handleMyAccount = () => {
    setShowSettingsDropdown(false);
    // TODO: Implement my account functionality
    console.log('My Account clicked');
  };

  const handleLogout = () => {
    setShowSettingsDropdown(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-gradient-to-r from-white/70 to-blue-50/40 dark:from-gray-900/60 dark:to-gray-800/40 border-b border-white/20 dark:border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-500 p-2 rounded-xl shadow-sm">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              TrackMate
            </h1>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-white/20 dark:border-white/10 transition-colors duration-200 backdrop-blur"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Settings dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleSettingsClick}
                className="p-2 rounded-xl bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-700/80 border border-white/20 dark:border-white/10 transition-colors duration-200 backdrop-blur"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Dropdown menu */}
              {showSettingsDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 dark:border-white/10 py-2 z-50">
                  {/* User info section */}
                  <div className="px-4 py-3 border-b border-white/20 dark:border-white/10">
                    <div className="flex items-center space-x-3">
                      {user?.picture_url ? (
                        <img
                          src={user.picture_url}
                          alt={user.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={handleMyAccount}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <User className="h-4 w-4" />
                      <span>My Account</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User profile picture only */}
            <div className="flex items-center">
              {user?.picture_url ? (
                <img
                  src={user.picture_url}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
