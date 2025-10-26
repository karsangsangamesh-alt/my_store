import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Tag, ShoppingCart, Image as ImageIcon } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch counts in parallel
  const [
    { count: productCount },
    { count: categoryCount },
    { count: orderCount },
    { count: bannerCount },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('banners').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      title: 'Total Products',
      value: productCount || 0,
      icon: <Package className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-50',
    },
    {
      title: 'Categories',
      value: categoryCount || 0,
      icon: <Tag className="h-6 w-6 text-green-500" />,
      color: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: orderCount || 0,
      icon: <ShoppingCart className="h-6 w-6 text-purple-500" />,
      color: 'bg-purple-50',
    },
    {
      title: 'Active Banners',
      value: bannerCount || 0,
      icon: <ImageIcon className="h-6 w-6 text-yellow-500" />,
      color: 'bg-yellow-50',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
