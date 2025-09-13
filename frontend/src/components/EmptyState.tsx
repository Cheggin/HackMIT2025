import React from 'react';
import { Package, MessageSquare, Search, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'products' | 'threads' | 'search' | 'generic';
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  message, 
  actionLabel, 
  onAction 
}) => {
  const configs = {
    products: {
      icon: <Package className="w-12 h-12 text-gray-400" />,
      title: 'No products yet',
      description: message || 'Be the first to submit a product for AI analysis',
      defaultActionLabel: 'Submit Product',
    },
    threads: {
      icon: <MessageSquare className="w-12 h-12 text-gray-400" />,
      title: 'No forum threads',
      description: message || 'Start a discussion about products, AI, or technology',
      defaultActionLabel: 'Start Thread',
    },
    search: {
      icon: <Search className="w-12 h-12 text-gray-400" />,
      title: 'No results found',
      description: message || 'Try adjusting your search terms or filters',
      defaultActionLabel: 'Clear Search',
    },
    generic: {
      icon: <Package className="w-12 h-12 text-gray-400" />,
      title: 'Nothing here yet',
      description: message || 'Check back later for new content',
      defaultActionLabel: 'Refresh',
    },
  };

  const config = configs[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center max-w-sm">
        {config.icon}
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          {config.title}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {config.description}
        </p>
        {(actionLabel || config.defaultActionLabel) && onAction && (
          <button
            onClick={onAction}
            className="mt-4 inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-ph-orange rounded-lg hover:bg-ph-orange-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{actionLabel || config.defaultActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;