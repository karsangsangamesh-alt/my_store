export interface Product {
  id: string;
  title: string;
  slug: string;
  brand?: string;
  price: number;
  mrp?: number;
  discount?: number;
  images: string[];
  category_id?: string;
  subcategory_id?: string;
  sizes?: string[];
  colors?: string[];
  metadata?: Record<string, unknown>;
  stock: number;
  rating?: number;
  created_at?: string;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  sizes?: string[];
  colors?: string[];
  rating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}