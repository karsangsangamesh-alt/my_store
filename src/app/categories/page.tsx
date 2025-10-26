'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function CategoriesPage() {
  const categories = [
    {
      name: 'Electronics',
      description: 'Latest gadgets, smartphones, laptops, and tech accessories',
      href: '/category/electronics',
      image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&h=300&fit=crop',
      productCount: 1250
    },
    {
      name: 'Fashion',
      description: 'Trendy clothing, shoes, and accessories for men and women',
      href: '/category/fashion',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=300&fit=crop',
      productCount: 2100
    },
    {
      name: 'Home & Garden',
      description: 'Furniture, decor, kitchenware, and garden supplies',
      href: '/category/home',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop',
      productCount: 850
    },
    {
      name: 'Sports & Outdoors',
      description: 'Fitness equipment, outdoor gear, and sporting goods',
      href: '/category/sports',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
      productCount: 650
    },
    {
      name: 'Beauty & Health',
      description: 'Cosmetics, skincare, wellness products, and personal care',
      href: '/category/beauty',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=300&fit=crop',
      productCount: 450
    },
    {
      name: 'Books & Media',
      description: 'Books, movies, music, and entertainment products',
      href: '/category/books',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop',
      productCount: 320
    },
    {
      name: 'Automotive',
      description: 'Car accessories, tools, and automotive parts',
      href: '/category/automotive',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop',
      productCount: 280
    },
    {
      name: 'Toys & Games',
      description: 'Toys, games, and entertainment for all ages',
      href: '/category/toys',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=300&fit=crop',
      productCount: 420
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Categories</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Shop by Category
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            Explore our wide range of products across different categories. Find exactly what you&apos;re looking for.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={500}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {category.productCount.toLocaleString()} products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse our complete product catalog or use our search feature to find exactly what you need.
          </p>
          <div className="space-x-4">
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Products
            </Link>
            <Link
              href="/search"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Search Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
