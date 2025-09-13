import React from 'react';
import clsx from 'clsx';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
  count = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';
  
  const variantClasses = {
    text: 'rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full',
  };

  const skeletonStyle = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={clsx(baseClasses, variantClasses[variant], className)}
          style={skeletonStyle}
        />
      ))}
    </>
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start space-x-4">
        <LoadingSkeleton variant="rect" width={64} height={64} />
        <div className="flex-1">
          <LoadingSkeleton variant="text" width="60%" height={24} className="mb-2" />
          <LoadingSkeleton variant="text" width="100%" height={16} className="mb-3" />
          <div className="flex space-x-2">
            <LoadingSkeleton variant="rect" width={60} height={24} />
            <LoadingSkeleton variant="rect" width={60} height={24} />
            <LoadingSkeleton variant="rect" width={60} height={24} />
          </div>
        </div>
        <LoadingSkeleton variant="rect" width={80} height={80} />
      </div>
    </div>
  );
};

export const ThreadCardSkeleton: React.FC = () => {
  return (
    <div className="p-3">
      <div className="flex items-start space-x-3">
        <LoadingSkeleton variant="circle" width={32} height={32} />
        <div className="flex-1">
          <LoadingSkeleton variant="text" width="80%" height={16} className="mb-2" />
          <LoadingSkeleton variant="text" width="40%" height={12} />
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;