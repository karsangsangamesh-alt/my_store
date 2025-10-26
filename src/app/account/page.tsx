'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
// Tabs components are imported but not used in the current implementation
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, LogOut, User, Package, CreditCard, HelpCircle, Settings } from 'lucide-react';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/formatPrice';

type ProfileFormData = {
  full_name: string;
  email: string;
  phone: string;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type Order = {
  id: string;
  created_at: string;
  amount: number;
  status: 'created' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
};

export default function AccountPage() {
  const router = useRouter();
  const { user, signOut: signOutFunction } = useAuth();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>();

  // Fetch user profile data
  const { data: profile, mutate: mutateProfile } = useSWR(
    user ? ['user_profile', user.id] : null,
    async () => {
      const { data } = await supabase
        .from('users_meta')
        .select('*')
        .eq('id', user?.id)
        .single();
      return data;
    }
  );

  // Fetch orders with proper SWR typing
  const { data: orders } = useSWR<Order[] | null>(
    user ? ['user_orders', user.id] : null,
    async ([, userId]) => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      return data as Order[] | null;
    },
    {
      revalidateOnFocus: false,
    }
  );

  // Update profile
  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updates = {
        id: user.id,
        full_name: data.full_name,
        phone: data.phone,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users_meta')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;
      
      // Update auth user's email if changed
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser(
          { email: data.email },
          { emailRedirectTo: `${window.location.origin}/auth/callback` }
        );
        if (emailError) throw emailError;
      }

      await mutateProfile();
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOutFunction();
    router.push('/auth/login');
  };

  // Set form default values when profile is loaded
  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        email: user?.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile, reset, user]);

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card>
            <CardHeader className="items-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-medium">{profile?.full_name || user.email?.split('@')[0]}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <Button
                  variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Button>
                <Button
                  variant={activeTab === 'orders' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('orders')}
                >
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Methods
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help Center
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' ? (
            <Card>
              <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>
                  Manage your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <Input
                      id="full_name"
                      {...register('full_name', { required: 'Full name is required' })}
                      placeholder="Enter your full name"
                      className={errors.full_name ? 'border-red-500' : ''}
                    />
                    {errors.full_name && (
                      <p className="mt-1 text-sm text-red-500">{errors.full_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      placeholder="Enter your email"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone', {
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Please enter a valid 10-digit phone number',
                        },
                      })}
                      placeholder="Enter your phone number"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>
                  View your order history and track shipments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!orders ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-gray-500">You haven&apos;t placed any orders yet.</p>
                    <Button className="mt-6" onClick={() => router.push('/')}>
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <Card key={order.id} className="overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Order #{order.id.split('-')[0]}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(order.amount)}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-4">
                            {order.items.slice(0, 2).map((item) => (
                              <div key={item.id} className="flex">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <Image
                                    src={item.image || '/placeholder-product.jpg'}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>
                                <div className="ml-4 flex-1">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-500">
                                      {formatPrice(item.price)} × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-sm text-gray-500">
                                +{order.items.length - 2} more items
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="border-t px-4 py-3 bg-gray-50 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            View Order
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
