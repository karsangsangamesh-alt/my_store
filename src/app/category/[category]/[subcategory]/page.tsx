import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Product type is defined inline in the query

type SubcategoryPageProps = {
  params: {
    category: string;
    subcategory: string;
  };
  searchParams: {
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
    page?: string;
    min_price?: string;
    max_price?: string;
  };
};

export default async function SubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
  const { category: categorySlug, subcategory: subcategorySlug } = params;
  const page = Number(searchParams.page) || 1;
  const itemsPerPage = 12;

  // Fetch category and subcategory details
  const { data: categoryData } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', categorySlug)
    .is('parent_id', null)
    .single();

  const { data: subcategoryData } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('slug', subcategorySlug)
    .single();

  if (!categoryData || !subcategoryData) {
    notFound();
  }

  // Build the products query
  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      price,
      sale_price,
      image_url,
      category:categories!inner(
        slug,
        parent_category:categories!inner(
          slug
        )
      )
    `)
    .eq('category.slug', subcategorySlug)
    .eq('category.parent_category.slug', categorySlug)
    .eq('is_active', true);

  // Apply sorting
  switch (searchParams.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'popular':
      // Note: You might want to implement a popularity metric in your database
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Apply price filtering
  if (searchParams.min_price) {
    query = query.gte('price', Number(searchParams.min_price));
  }
  if (searchParams.max_price) {
    query = query.lte('price', Number(searchParams.max_price));
  }

  // Apply pagination
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  query = query.range(from, to);

  const { data: products, count } = await query;

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link 
              href={`/category/${categoryData.slug}`} 
              className="text-gray-500 hover:text-gray-700"
            >
              {categoryData.name}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{subcategoryData.name}</li>
        </ol>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-medium mb-4 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Price Range</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    name="min_price"
                    className="w-20 p-2 border rounded text-sm"
                    defaultValue={searchParams.min_price || ''}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    name="max_price"
                    className="w-20 p-2 border rounded text-sm"
                    defaultValue={searchParams.max_price || ''}
                  />
                  <Button size="sm">Apply</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{subcategoryData.name}</h1>
            
            <div className="flex items-center">
              <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by:</label>
              <select 
                id="sort" 
                className="border rounded p-2 text-sm"
                defaultValue={searchParams.sort || 'newest'}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {subcategoryData.description && (
            <div className="prose max-w-none mb-8">
              <p>{subcategoryData.description}</p>
            </div>
          )}

          {products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <Link href={`/product/${product.slug}`}>
                      <div className="aspect-square bg-gray-100 relative">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        {product.sale_price && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Sale
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center">
                          {product.sale_price ? (
                            <>
                              <span className="text-lg font-bold text-gray-900">
                                ${product.sale_price.toFixed(2)}
                              </span>
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                ${product.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    {page > 1 && (
                      <Link 
                        href={`?${new URLSearchParams({
                          ...searchParams,
                          page: (page - 1).toString()
                        })}`}
                        className="px-3 py-1 border rounded"
                      >
                        Previous
                      </Link>
                    )}
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show current page in the middle of the pagination when possible
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <Link
                          key={pageNum}
                          href={`?${new URLSearchParams({
                            ...searchParams,
                            page: pageNum.toString()
                          })}`}
                          className={`px-3 py-1 border rounded ${
                            page === pageNum 
                              ? 'bg-primary text-white border-primary' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}

                    {page < totalPages && (
                      <Link 
                        href={`?${new URLSearchParams({
                          ...searchParams,
                          page: (page + 1).toString()
                        })}`}
                        className="px-3 py-1 border rounded"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">We couldn&apos;t find any products in this category.</p>
              <Button asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
