// src/app/admin/(protected)/orders/page.tsx
"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/admin/select'
import { StatusBadge } from '@/components/admin/status-badge'
import { toast } from 'sonner'
import { Loader2, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { formatPrice } from '@/utils/formatPrice'

type Order = {
  id: string
  user_id: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  user: {
    email: string
    users_meta: {
      full_name: string
    } | null
  } | null
  order_items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }>
}

const statuses = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const supabase = createClientComponentClient()

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Fetch orders with user and product details
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:user_id (email, users_meta (full_name)),
          order_items (*, product:products (name))
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: true }))
      
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ))
      
      toast.success('Order status updated')
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }))
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {order.user?.users_meta?.full_name || order.user?.email || 'Guest'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.user?.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {order.order_items.slice(0, 2).map((item) => (
                        <div key={item.id} className="text-sm">
                          {item.quantity} × {item.product?.name}
                        </div>
                      ))}
                      {order.order_items.length > 2 && (
                        <div className="text-sm text-muted-foreground">
                          +{order.order_items.length - 2} more items
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Select
                        value={order.status}
                        onValueChange={(value: Order['status']) =>
                          updateOrderStatus(order.id, value)
                        }
                        disabled={updatingStatus[order.id]}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statuses).map(([value, { label }]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}