/**
 * Supabase Connection Test Script
 *
 * Run this script to verify your Supabase connection is working correctly.
 * Add this to a test file or run in browser console.
 */

import { supabase } from './src/lib/supabaseClient';

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...');

  try {
    // Test basic connection
    console.log('📡 Testing basic connection...');
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
      return;
    }

    console.log('✅ Connection successful!');

    // Test fetching products
    console.log('📦 Testing product fetch...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (productsError) {
      console.error('❌ Product fetch failed:', productsError);
    } else {
      console.log('✅ Product fetch successful!');
      console.log('📊 Products found:', products?.length || 0);
      if (products && products.length > 0) {
        console.log('📝 Sample product:', products[0]);
      }
    }

    // Test categories
    console.log('🏷️ Testing categories fetch...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);

    if (categoriesError) {
      console.error('❌ Categories fetch failed:', categoriesError);
    } else {
      console.log('✅ Categories fetch successful!');
      console.log('📊 Categories found:', categories?.length || 0);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// For browser console usage:
if (typeof window !== 'undefined') {
  window.testSupabaseConnection = testSupabaseConnection;
  console.log('🔧 Run testSupabaseConnection() in console to test your setup');
}

// For Node.js usage:
// testSupabaseConnection();
