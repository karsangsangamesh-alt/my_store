# Supabase Database Setup Guide

## Environment Variables

First, create a `.env.local` file in your project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Schema

Create the following tables in your Supabase database:

### 1. Products Table
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  brand VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  discount DECIMAL(5,2),
  images TEXT[] DEFAULT '{}',
  category_id UUID,
  subcategory_id UUID,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_stock ON products(stock) WHERE stock > 0;
```

### 2. Categories Table
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

### 3. Cart Items Table
```sql
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cart_items_user ON cart_items(user_id);
```

### 4. Reviews Table
```sql
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
```

### 6. Banners Table
```sql
CREATE TABLE banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_banners_position ON banners(position);
CREATE INDEX idx_banners_active ON banners(is_active);
```

## Storage Setup

Create a storage bucket for images:

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket named `images`
4. Set it to public
5. Configure RLS policies to allow authenticated users to upload and public to read

```sql
-- Enable RLS on banners table
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Policy for admin users to manage banners
CREATE POLICY "Admin users can manage banners" ON banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_meta
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Allow public read access to active banners
CREATE POLICY "Public can view active banners" ON banners
  FOR SELECT USING (is_active = true);
```

### Storage Policies

```sql
-- Create storage policies for images bucket
CREATE POLICY "Admin users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM users_meta
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admin users can update images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM users_meta
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM users_meta
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');
```

## Sample Data

Insert some sample products:

```sql
INSERT INTO products (title, slug, brand, price, mrp, images, stock, rating) VALUES
('iPhone 15 Pro', 'iphone-15-pro', 'Apple', 99999, 109999, ARRAY['/images/iphone-15-pro-1.jpg', '/images/iphone-15-pro-2.jpg'], 50, 4.5),
('Samsung Galaxy S24', 'samsung-galaxy-s24', 'Samsung', 79999, 89999, ARRAY['/images/galaxy-s24-1.jpg'], 30, 4.3),
('MacBook Air M2', 'macbook-air-m2', 'Apple', 89999, 99999, ARRAY['/images/macbook-air-1.jpg'], 20, 4.7),
('Nike Air Max', 'nike-air-max', 'Nike', 8999, 9999, ARRAY['/images/nike-airmax-1.jpg', '/images/nike-airmax-2.jpg'], 100, 4.2);

INSERT INTO categories (name, slug, position) VALUES
('Electronics', 'electronics', 1),
('Clothing', 'clothing', 2),
('Sports', 'sports', 3);

-- Sample Banners
INSERT INTO banners (title, image_url, position, is_active) VALUES
('Summer Sale', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop', 1, true),
('New Collection', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop', 2, true);

## Testing the Integration

1. **Check Environment Variables**: Make sure your `.env.local` file has the correct Supabase credentials.

2. **Test Database Connection**: Open browser console and check for any connection errors.

3. **Verify Product URLs**: Try accessing `/product/iphone-15-pro` (replace with your actual product slugs).

4. **Check Console Logs**: The updated code includes detailed logging to help debug issues.

## Common Issues

1. **"Product not found"**: Check if the slug exists in your database
2. **Connection errors**: Verify Supabase URL and keys are correct
3. **Permission errors**: Make sure RLS (Row Level Security) policies allow public read access to products

## Next Steps

Once your database is set up:

1. Add more sample products with proper categories
2. Set up product images in your public folder or use external URLs
3. Configure authentication for cart and wishlist features
4. Add more comprehensive error handling as needed
