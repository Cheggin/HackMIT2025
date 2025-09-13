import React from 'react';
import { MessageCircle, Eye, Clock, User } from 'lucide-react';
import type { Thread } from '../stores/useStore';
import clsx from 'clsx';

interface ThreadCardProps {
  thread: Thread;
  compact?: boolean;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread, compact = false }) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'AI': 'bg-purple-100 text-purple-700',
      'Business': 'bg-blue-100 text-blue-700',
      'No-Code': 'bg-green-100 text-green-700',
      'Design': 'bg-pink-100 text-pink-700',
      'Development': 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (compact) {
    return (
      <a
        href={`#thread/${thread.id}`}
        className="block p-3 hover:bg-gray-50 rounded-lg transition-colors group"
      >
        <div className="flex items-start space-x-3">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            {thread.author.avatar ? (
              <img
                src={thread.author.avatar}
                alt={thread.author.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>

          {/* Thread Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 group-hover:text-ph-orange transition-colors line-clamp-2">
              {thread.title}
            </h4>
            <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500">
              <span className="font-medium">{thread.author.name}</span>
              <span>•</span>
              <span>{formatTimeAgo(thread.lastActivity)}</span>
            </div>
            <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{thread.replies}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{thread.views}</span>
              </div>
              <span className={clsx(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                getCategoryColor(thread.category)
              )}>
                {thread.category}
              </span>
            </div>
          </div>
        </div>
      </a>
    );
  }

  // Full card display
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all hover:shadow-lg">
      <div className="flex items-start space-x-3">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          {thread.author.avatar ? (
            <img
              src={thread.author.avatar}
              alt={thread.author.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
          )}
        </div>

        {/* Thread Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <a
                href={`#thread/${thread.id}`}
                className="text-base font-semibold text-gray-900 hover:text-ph-orange transition-colors"
              >
                {thread.title}
              </a>
              <div className="mt-1 flex items-center space-x-2 text-sm text-gray-600">
                <a
                  href={`#user/${thread.author.id}`}
                  className="font-medium hover:text-ph-orange transition-colors"
                >
                  {thread.author.name}
                </a>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(thread.lastActivity)}</span>
                </div>
              </div>
            </div>
            
            <span className={clsx(
              'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium',
              getCategoryColor(thread.category)
            )}>
              {thread.category}
            </span>
          </div>

          {/* Thread Stats */}
          <div className="mt-3 flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-sm text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{thread.replies}</span>
              <span className="text-gray-500">replies</span>
            </div>
            <div className="flex items-center space-x-1.5 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{thread.views}</span>
              <span className="text-gray-500">views</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadCard;