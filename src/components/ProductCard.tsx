'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/Product';
import { formatPrice, calculateDiscount } from '@/utils/formatPrice';
import {WishlistButton } from './WishlistButton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.mrp ? calculateDiscount(product.mrp, product.price) : 0;

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/product/${product.slug}`}>
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
              {discount}% OFF
            </div>
          )}
        </div>
      </Link>

      <div className="absolute top-2 right-2">
        <WishlistButton
          item={{
            id: product.id,
            name: product.title,
            price: product.price,
            image: product.images?.[0] || ''
          }}
        />
      </div>

      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-lg mb-1 text-gray-900 hover:text-blue-600 transition truncate">
            {product.title}
          </h3>
          {product.brand && (
            <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
          )}
        </Link>

        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>

        {product.rating && (
          <div className="flex items-center text-sm">
            <span className="text-yellow-500">★</span>
            <span className="ml-1 text-gray-700">{product.rating}</span>
          </div>
        )}
      </div>
    </div>
  );
}