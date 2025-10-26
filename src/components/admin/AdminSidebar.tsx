'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { name: 'Products', href: '/admin/products', icon: '📦' },
  { name: 'Categories', href: '/admin/categories', icon: '🏷️' },
  { name: 'Orders', href: '/admin/orders', icon: '🛒' },
  { name: 'Banners', href: '/admin/banners', icon: '🖼️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  return (
    <div className="w-64 bg-white border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-600"
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}
