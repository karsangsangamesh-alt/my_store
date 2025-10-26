// src/app/admin/(protected)/categories/page.tsx
"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/select'

type Category = {
  id: string
  name: string
  parent_id: string | null
  created_at: string
  subcategories?: Category[]
  parent?: Category | null
}

type CategoryFormData = {
  name: string
  parent_id: string | null
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    parent_id: null
  })
  const router = useRouter()
  const supabase = createClientComponentClient()

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Fetch all categories with parent relationships
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error

      // Build hierarchical structure
      const categoriesMap = new Map<string, Category>()
      const rootCategories: Category[] = []

      // First pass: create all category objects
      data?.forEach(cat => {
        categoriesMap.set(cat.id, {
          ...cat,
          subcategories: []
        })
      })

      // Second pass: build parent-child relationships
      data?.forEach(cat => {
        const category = categoriesMap.get(cat.id)!
        if (cat.parent_id) {
          const parent = categoriesMap.get(cat.parent_id)
          if (parent) {
            parent.subcategories = parent.subcategories || []
            parent.subcategories.push(category)
          }
        } else {
          rootCategories.push(category)
        }
      })

      setCategories(rootCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const resetForm = () => {
    setFormData({ name: '', parent_id: null })
    setEditingCategory(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setFormData({
      name: category.name,
      parent_id: category.parent_id
    })
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setIsSubmitting(true)
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name.trim(),
            parent_id: formData.parent_id || null
          })
          .eq('id', editingCategory.id)

        if (error) throw error
        toast.success('Category updated successfully')
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: formData.name.trim(),
            parent_id: formData.parent_id || null
          }])

        if (error) throw error
        toast.success('Category created successfully')
      }

      setIsDialogOpen(false)
      resetForm()
      fetchCategories()
    } catch (error: unknown) {
      console.error('Error saving category:', error)
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        toast.error('A category with this name already exists')
      } else {
        toast.error('Failed to save category')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (category: Category) => {
    try {
      // Check if category has subcategories
      if (category.subcategories && category.subcategories.length > 0) {
        toast.error('Cannot delete category with subcategories. Please delete subcategories first.')
        return
      }

      // Check if category has linked products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', category.id)
        .limit(1)

      if (productsError) throw productsError

      if (products && products.length > 0) {
        toast.error('Cannot delete category with products. Please move or delete products first.')
        return
      }

      // Delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)

      if (error) throw error

      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const getAvailableParentCategories = () => {
    return categories.filter(cat =>
      editingCategory ? cat.id !== editingCategory.id : true
    )
  }

  const renderCategoryRow = (category: Category, level = 0) => {
    const subcategoriesCount = category.subcategories?.length || 0
    const hasSubcategories = subcategoriesCount > 0

    return (
      <TableRow key={category.id}>
        <TableCell className="font-medium">
          <div style={{ paddingLeft: `${level * 20}px` }}>
            {hasSubcategories && <span className="mr-2">📁</span>}
            {category.name}
          </div>
        </TableCell>
        <TableCell>
          {category.parent?.name || 'Root Category'}
        </TableCell>
        <TableCell>
          {subcategoriesCount} {subcategoriesCount === 1 ? 'subcategory' : 'subcategories'}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDialog(category)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Category</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete &quot;{category.name}&quot;? This action cannot be undone.
                    {hasSubcategories && (
                      <span className="block mt-2 text-red-600">
                        This category has {subcategoriesCount} subcategories that must be deleted first.
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {}}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handleDelete(category)
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  const renderCategoriesTable = (categories: Category[], level = 0): React.JSX.Element[] => {
    return categories.map(category => (
      <>
        {renderCategoryRow(category, level)}
        {category.subcategories && category.subcategories.length > 0 &&
          renderCategoriesTable(category.subcategories, level + 1)
        }
      </>
    ))
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
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="parent">Parent Category (Optional)</Label>
                <Select
                  value={formData.parent_id || ''}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parent_id: value === 'none' ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Root Category</SelectItem>
                    {getAvailableParentCategories().map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>Subcategories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No categories found. Create your first category to get started.
                </TableCell>
              </TableRow>
            ) : (
              renderCategoriesTable(categories)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}