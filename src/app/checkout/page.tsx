'use client';

import { useForm } from 'react-hook-form';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

// Using the CartItem from types/cart to avoid conflicts
import { CartItem as CartItemType } from '@/types/cart';

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

declare global {
  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: {
      address?: string;
    };
    theme?: {
      color?: string;
    };
    modal?: {
      ondismiss?: () => void;
      escape?: boolean;
      backdropclose?: boolean;
      confirm_close?: boolean;
      [key: string]: string | number | boolean | (() => void) | undefined;
    };
    [key: string]: string | number | boolean | (() => void) | object | undefined;
  }

  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

type FormData = {
  address: string;
  city: string;
  postalCode: string;
  phone: string;
};

export default function Checkout() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { items: cart } = useCart() as { items: CartItemType[] };
  const { user: session } = useAuth();
  const router = useRouter();

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
            <ShoppingBag className="w-full h-full" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add items to your cart to proceed to checkout.</p>
          <Link href="/products">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const total = cart.reduce((sum: number, item: CartItemType) => {
    const itemPrice = item.price; // Using price directly from CartItem
    return sum + (itemPrice * item.quantity);
  }, 0);

  const handlePayment = async (formData: FormData) => {
    try {
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          total,
          address: formData,
          userId: session.id,
        }),
      });
      const { orderId } = await response.json();

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY) {
        throw new Error('Razorpay key is not configured');
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: Math.round(total * 100), // Convert to paise and round to avoid decimals
        currency: 'INR',
        name: 'Your Store Name',
        description: 'Order Payment',
        order_id: orderId,
        handler: function (response: RazorpayResponse) {
          // Handle successful payment
          console.log('Payment successful:', response);
          router.push('/order-confirmation');
        },
        prefill: {
          name: session?.user_metadata?.full_name || '',
          email: session.email,
          contact: formData.phone,
        },
        theme: { 
          color: '#2563eb' 
        },
        modal: {
          ondismiss: function() {
            // Handle when user closes the payment modal
            console.log('Payment modal dismissed');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to initiate payment');
    }
  };

  const onSubmit = (formData: FormData) => {
    handlePayment(formData);
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Address Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-xl font-semibold">Delivery Address</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                {...register('address', { required: 'Address is required' })}
                className="border p-2 w-full rounded"
                placeholder="Street Address"
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                {...register('city', { required: 'City is required' })}
                className="border p-2 w-full rounded"
                placeholder="City"
              />
              {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input
                {...register('postalCode', { required: 'Postal code is required' })}
                className="border p-2 w-full rounded"
                placeholder="Postal Code"
              />
              {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                {...register('phone', { required: 'Phone number is required' })}
                className="border p-2 w-full rounded"
                placeholder="Phone Number"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            </div>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 w-full">
              Proceed to Payment
            </Button>
          </form>

          {/* Cart Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            {cart.map((item: CartItemType) => (
              <div key={item.id} className="flex gap-4 mb-4">
                <div className="relative w-20 h-20">
                  {item.product?.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.title}
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <ShoppingBag className="w-full h-full text-gray-300" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{item.product?.title}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
            <div className="border-t pt-4">
              <p className="text-lg font-bold">Total: {formatPrice(total)}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}