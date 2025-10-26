import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
};

export default async function CategoryPage({ params }: { params: { category: string } }) {
  // Fetch the parent category
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', params.category)
    .is('parent_id', null) // Ensure it's a top-level category
    .single();

  if (categoryError || !category) {
    notFound();
  }

  // Fetch subcategories
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from('categories')
    .select('id, name, slug, image_url')
    .eq('parent_id', category.id)
    .order('position', { ascending: true });

  if (subcategoriesError) {
    console.error('Subcategories fetch error:', subcategoriesError);
    return <div className="container mx-auto px-4 py-8">Error loading subcategories</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{category.name}</h1>
      {subcategories && subcategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {subcategories.map((sub: Category) => (
            <Link
              key={sub.id}
              href={`/category/${category.slug}/${sub.slug}`}
              className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative aspect-square">
                {sub.image_url ? (
                  <Image
                    src={sub.image_url}
                    alt={sub.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{sub.name}</h3>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-blue-500 group-hover:text-white transition-colors"
                >
                  Shop Now
                </Button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-6">No subcategories found for {category.name}.</p>
          <Link href="/category/men">
            <Button className="bg-blue-500 hover:bg-blue-600">
              Continue Shopping
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}