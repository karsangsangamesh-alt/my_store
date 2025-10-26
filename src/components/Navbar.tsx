'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';
import { Skeleton } from '@/components/ui/skeleton';

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('position', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-gray-900">
            MyStore
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            
            {loading ? (
              // Skeleton loaders while categories are loading
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))
            ) : (
              // Actual category links
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="text-gray-700 hover:text-blue-600 transition capitalize"
                >
                  {category.name}
                </Link>
              ))
            )}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/account">
              <Button variant="ghost">Account</Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline">Cart</Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t mt-4">
            <div className="space-y-4">
              <Link
                href="/"
                className="block text-gray-700 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {loading ? (
                // Skeleton loaders for mobile
                Array(3).fill(0).map((_, i) => (
                  <Skeleton key={`mobile-${i}`} className="h-6 w-full my-1" />
                ))
              ) : (
                // Mobile category links
                categories.map((category) => (
                  <Link
                    key={`mobile-${category.id}`}
                    href={`/category/${category.slug}`}
                    className="block text-gray-700 hover:text-blue-600 py-2 capitalize"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))
              )}
              
              <div className="pt-4">
                <SearchBar />
              </div>
              
              <div className="flex space-x-4 pt-2">
                <Link href="/account" className="w-1/2">
                  <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Account
                  </Button>
                </Link>
                <Link href="/cart" className="w-1/2">
                  <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Cart
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}