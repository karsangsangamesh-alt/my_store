"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  images: string[];
  category?: string;
  description?: string;
}

type SearchFunction = (query: string) => Promise<void>;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  // Memoize the search function
  const performSearch = useCallback<SearchFunction>(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return Promise.resolve();
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Update URL with search query
      const params = new URLSearchParams(searchParams.toString());
      params.set('q', query);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });

      // Simulate API call - replace with your actual API call
      // const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      // const data = await response.json();

      // Mock data - replace with actual API response
      const mockResults: Product[] = [
        {
          id: '1',
          title: 'Example Product 1',
          price: 29.99,
          images: ['/placeholder-product.jpg'],
          category: 'Electronics',
        },
        {
          id: '2',
          title: 'Example Product 2',
          price: 49.99,
          images: ['/placeholder-product.jpg'],
          category: 'Clothing',
        },
      ].filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.category?.toLowerCase() || '').includes(query.toLowerCase())
      );

      setResults(mockResults);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to fetch search results. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router, searchParams]);

  // Debounce search function
  const searchProducts = useCallback((query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Don't perform search if query is empty
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    debounceTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  }, [performSearch]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Trigger search when query changes
  useEffect(() => {
    searchProducts(searchQuery);
    
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery, searchProducts]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-sm text-gray-600">Searching...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && searchQuery && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No results found for &quot;{searchQuery}&quot;</p>
          <p className="text-sm text-gray-500 mt-2">Try different keywords or check for typos</p>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {results.length} {results.length === 1 ? 'result' : 'results'} for &quot;{searchQuery}&quot;
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((product) => (
              <Link 
                key={product.id} 
                href={`/product/${product.id}`}
                className="group relative bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 h-48 relative">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 p-4 flex flex-col">
                  <h3 className="text-sm font-medium text-gray-900">
                    {product.title}
                  </h3>
                  {product.category && (
                    <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                  )}
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!searchQuery && !isLoading && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Search for products</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start typing to find what you&apos;re looking for.
          </p>
        </div>
      )}
    </div>
  );
}
