'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CartItem } from '@/types/cart';
import { useAuth } from './useAuth';

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', user.id);

      if (!error && data) {
        // Map the data to match the CartItem type from cart.ts
        const cartItems: CartItem[] = data.map(item => ({
          id: item.id,
          product: item.product,
          quantity: item.quantity,
          price: item.product?.price || 0
        }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch when component mounts or user changes
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        await fetchCart();
      } else {
        setItems([]);
        setLoading(false);
      }
    };
    
    loadCart();
  }, [user, fetchCart]);

  const addItem = async (
    productId: string,
    quantity: number = 1,
    metadata?: { size?: string; color?: string }
  ) => {
    if (!user) return { error: new Error('User not authenticated') };

    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity,
        metadata,
      })
      .select('*, product:products(*)')
      .single();

    if (!error && data) {
      const newItem: CartItem = {
        id: data.id,
        product: data.product,
        quantity: data.quantity,
        price: data.product?.price || 0
      };
      setItems([...items, newItem]);
    }
    return { data, error };
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (!error) {
      setItems(items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
    return { error };
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      setItems(items.filter(item => item.id !== itemId));
    }
    return { error };
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setItems([]);
    }
    return { error };
  };

  const total = items.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  return {
    items,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    total,
    count: items.length,
  };
}