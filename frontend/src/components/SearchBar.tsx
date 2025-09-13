import React, { useEffect, useRef, useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '../stores/useStore';

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery, setSearchOpen, getFilteredProducts } = useStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const products = getFilteredProducts();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [setSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
  };

  const handleClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-20 px-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Search Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full animate-slide-down">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center px-4 py-3 border-b border-gray-200">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={localQuery}
                onChange={(e) => {
                  setLocalQuery(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Search products, categories, or makers..."
                className="flex-1 text-lg outline-none placeholder-gray-400"
              />
              <button
                type="button"
                onClick={handleClose}
                className="ml-3 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </form>

          {/* Search Results */}
          {localQuery && (
            <div className="max-h-96 overflow-y-auto">
              {products.length > 0 ? (
                <div className="py-2">
                  {products.slice(0, 5).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        // Navigate to product
                        handleClose();
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          {product.logo ? (
                            <img src={product.logo} alt={product.name} className="w-8 h-8 rounded" />
                          ) : (
                            <span className="text-xs font-medium text-gray-500">
                              {product.name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.tagline}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  No products found for "{localQuery}"
                </div>
              )}
            </div>
          )}

          {/* Quick Links */}
          {!localQuery && (
            <div className="px-4 py-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Quick Links
              </div>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Today's Top Products
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Trending AI Tools
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  Submit a Product
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;