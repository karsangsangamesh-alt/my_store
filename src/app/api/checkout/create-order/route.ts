import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type Product = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
};

type CartItem = {
  id: string;
  quantity: number;
  products: Product;
};

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

// Helper function to create Razorpay order
async function createRazorpayOrder(amount: number, receipt: string, notes: Record<string, string>) {
  const auth = 'Basic ' + Buffer.from(`${RAZORPAY_KEY}:${RAZORPAY_SECRET}`).toString('base64');
  
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': auth
    },
    body: JSON.stringify({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt,
      payment_capture: 1,
      notes
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.description || 'Failed to create Razorpay order');
  }

  return response.json();
}

export async function POST() {
  try {
    if (!RAZORPAY_KEY || !RAZORPAY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's cart items with product details
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        products:product_id (
          id,
          name,
          price,
          stock_quantity
        )
      `)
      .eq('user_id', session.user.id) as { data: CartItem[] | null; error: { message: string; code?: string } | null };

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate total amount and verify stock
    let totalAmount = 0;
    const orderItems: Array<{
      product_id: string;
      quantity: number;
      price: number;
      name: string;
    }> = [];
    
    for (const item of cartItems) {
      if (!item.products) continue;
      
      if (item.products.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.products.name}` },
          { status: 400 }
        );
      }
      
      const itemTotal = item.products.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product_id: item.products.id,
        quantity: item.quantity,
        price: item.products.price,
        name: item.products.name
      });
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: session.user.id,
          amount: totalAmount,
          status: 'created',
          items: orderItems
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create Razorpay order
    const receipt = `order_${order.id}`;
    const razorpayOrder = await createRazorpayOrder(
      totalAmount,
      receipt,
      {
        order_id: order.id,
        user_id: session.user.id
      }
    );

    return NextResponse.json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      orderId: order.id,
      key: RAZORPAY_KEY
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}