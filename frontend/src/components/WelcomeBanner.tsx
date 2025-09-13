import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { useStore } from '../stores/useStore';

const WelcomeBanner: React.FC = () => {
  const { welcomeBannerDismissed, dismissWelcomeBanner } = useStore();

  if (welcomeBannerDismissed) return null;

  return (
    <div className="bg-ph-beige border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-ph-orange" />
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Welcome to ProductHunt AI!</span>
              <span className="ml-2">
                Discover products analyzed by 5 specialized AI agents instead of traditional voting.
              </span>
              <a
                href="#tour"
                className="ml-2 text-ph-orange font-medium hover:text-ph-orange-dark transition-colors"
              >
                Take a tour →
              </a>
            </div>
          </div>
          <button
            onClick={dismissWelcomeBanner}
            className="p-1 rounded-lg hover:bg-white/50 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;