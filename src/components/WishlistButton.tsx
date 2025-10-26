'use client';

import { useState } from 'react';
import { useWishlist } from '../app/wishlist/WishlistContext';

interface WishlistButtonProps {
  item: {
    id: string | number;
    name: string;
    price: number;
    image?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WishlistButton = ({
  item,
  size = 'md',
  className = '',
}: WishlistButtonProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  
  const isWishlisted = isInWishlist(item.id);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${sizeClasses[size]} ${className} flex items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className={`h-5/6 w-5/6 transition-colors ${
          isWishlisted || isHovered ? 'text-red-500' : 'text-gray-400'
        }`}
        fill={isWishlisted ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};