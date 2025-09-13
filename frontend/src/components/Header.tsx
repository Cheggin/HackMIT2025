import React, { useEffect, useState } from 'react';
import { Search, Command, User, LogOut } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';

const Header: React.FC = () => {
  const { isSearchOpen, setSearchOpen, user } = useStore();
  const { signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  const navigation = [
    { name: 'Launches', href: '#launches' },
    { name: 'Products', href: '#products' },
    { name: 'News', href: '#news' },
    { name: 'Forums', href: '#forums' },
    { name: 'Advertise', href: '#advertise' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-ph-orange rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">AI</span>
                </div>
                <span className="font-bold text-xl text-gray-900">ProductHunt AI</span>
              </a>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Search products...</span>
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </div>
              </button>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3 ml-6">
              <button className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Subscribe
              </button>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-ph-orange rounded-lg hover:bg-ph-orange-dark transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-slide-down">
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="px-4 py-2 text-sm font-medium text-white bg-ph-orange rounded-lg hover:bg-ph-orange-dark transition-colors">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && <SearchBar />}
    </>
  );
};

export default Header;