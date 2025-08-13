import React from 'react';
import { 
  Search, 
  Bell, 
  User, 
  Moon, 
  Sun, 
  Settings, 
  LogOut,
  Plus,
  Command
} from 'lucide-react';
import { Menu } from '@headlessui/react';
import { useAuthStore, useUIStore } from '../../store';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement global search functionality
    console.log('Search for:', searchQuery);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section - Search */}
      <div className="flex items-center flex-1 max-w-md">
        <form onSubmit={handleSearch} className="relative w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">
                <Command className="h-3 w-3 mr-0.5" />
                K
              </kbd>
            </div>
          </div>
          
          {/* Search Results Dropdown */}
          <AnimatePresence>
            {searchOpen && searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
              >
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">
                    Recent Searches
                  </div>
                  {/* Add search results here */}
                  <div className="space-y-1">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        Customer - Sample Customer
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* Quick Create */}
        <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />}>
          Create
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-gray-500" />
          ) : (
            <Sun className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.full_name || 'User'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </div>
            </div>
          </Menu.Button>

          <AnimatePresence>
            <Menu.Items
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
            >
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={clsx(
                      'flex items-center w-full px-4 py-2 text-sm transition-colors',
                      active ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </button>
                )}
              </Menu.Item>
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={clsx(
                      'flex items-center w-full px-4 py-2 text-sm transition-colors',
                      active ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </button>
                )}
              </Menu.Item>
              
              <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={clsx(
                      'flex items-center w-full px-4 py-2 text-sm transition-colors',
                      active ? 'bg-gray-50 dark:bg-gray-700 text-red-600 dark:text-red-400' : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </AnimatePresence>
        </Menu>
      </div>
    </header>
  );
};

// Add missing FileText import
import { FileText } from 'lucide-react';

export default Header;