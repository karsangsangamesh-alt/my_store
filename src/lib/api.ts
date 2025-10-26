import { supabase } from './supabaseClient';
import { Product, ProductFilters } from '@/types/Product';
import { Category } from '@/types/Category';

export const api = {
  // Products
  async getProducts(filters?: ProductFilters) {
    let query = supabase.from('products').select('*');

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters?.subcategory) {
      query = query.eq('subcategory_id', filters.subcategory);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      console.log('No products found with filters:', filters);
      throw new Error('No products found');
    }

    console.log('Products data fetched successfully:', data);
    return data as Product[];
  },

  async getProductBySlug(slug: string) {
    console.log('API: Fetching product by slug:', slug);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      console.log('No product found with slug:', slug);
      throw new Error('Product not found');
    }

    console.log('Product data fetched successfully:', data);
    return data as Product;
  },

  // Categories
  async getCategories() {
    console.log('API: Fetching categories');

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('position');
    if (error) throw error;
    return data as Category[];
  },

  async getCategoryWithSubcategories(slug: string) {
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    if (catError) throw catError;

    const { data: subcategories, error: subError } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', category.id)
      .order('position');
    if (subError) throw subError;

    return { ...category, subcategories } as Category;
  },

  // Hero Slides
  async getHeroSlides() {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('position');
    if (error) throw error;
    return data;
  },
};