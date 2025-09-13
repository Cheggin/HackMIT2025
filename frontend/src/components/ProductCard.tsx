import React from 'react';
import { MessageCircle, TrendingUp, ExternalLink } from 'lucide-react';
import type { Product } from '../stores/useStore';
import AIScoreDisplay from './AIScoreDisplay';
import clsx from 'clsx';

interface ProductCardProps {
  product: Product;
  isRanked?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isRanked = false }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg group">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Rank Number */}
          {isRanked && product.rank && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-gray-700">#{product.rank}</span>
              </div>
            </div>
          )}

          {/* Product Logo */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
              {product.logo ? (
                <img 
                  src={product.logo} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-gray-500">
                  {product.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-ph-orange transition-colors">
                  <a href={`#product/${product.id}`} className="flex items-center space-x-2">
                    <span className="truncate">{product.name}</span>
                    {product.website && (
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </a>
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {product.tagline}
                </p>

                {/* Categories */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.categories.slice(0, 3).map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {category}
                    </span>
                  ))}
                  {product.categories.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs text-gray-500">
                      +{product.categories.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* AI Score Section */}
              <div className="flex-shrink-0 ml-4">
                <AIScoreDisplay 
                  score={product.aiScore} 
                  analyses={product.aiAnalyses}
                  compact={true}
                />
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{product.commentCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Trending</span>
              </div>
              {product.submittedBy && (
                <div className="flex items-center space-x-1">
                  <span>by</span>
                  <a href={`#user/${product.submittedBy}`} className="font-medium text-gray-700 hover:text-ph-orange transition-colors">
                    @{product.submittedBy}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;