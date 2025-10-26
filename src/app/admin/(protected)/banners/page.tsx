'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Image from 'next/image'

type Banner = {
  id: string
  title: string
  image_url: string
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/banners')

      if (!response.ok) {
        throw new Error('Failed to fetch banners')
      }

      const data = await response.json()
      setBanners(data || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete banner')
      }

      setBanners(banners.filter(banner => banner.id !== id))
      toast.success('Banner deleted successfully')
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error('Failed to delete banner')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentBanner) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('title', currentBanner.title)
      formData.append('position', currentBanner.position.toString())
      formData.append('is_active', currentBanner.is_active.toString())

      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      const url = currentBanner.id ? `/api/banners/${currentBanner.id}` : '/api/banners'
      const method = currentBanner.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save banner')
      }

      const savedBanner = await response.json()

      if (currentBanner.id) {
        setBanners(banners.map(banner =>
          banner.id === currentBanner.id ? savedBanner : banner
        ))
        toast.success('Banner updated successfully')
      } else {
        setBanners([savedBanner, ...banners])
        toast.success('Banner created successfully')
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error: unknown) {
      console.error('Error saving banner:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save banner'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCurrentBanner(null)
    setImagePreview('')
    setSelectedFile(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const openCreateDialog = () => {
    setCurrentBanner({
      id: '',
      title: '',
      image_url: '',
      position: banners.length + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (banner: Banner) => {
    setCurrentBanner(banner)
    setImagePreview('')
    setSelectedFile(null)
    setIsDialogOpen(true)
  }

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentBanner?.id ? 'Edit Banner' : 'Add New Banner'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentBanner?.title || ''}
                  onChange={(e) => setCurrentBanner({
                    ...currentBanner!,
                    title: e.target.value
                  })}
                  required
                  placeholder="Enter banner title"
                />
              </div>

              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  min="1"
                  value={currentBanner?.position || 1}
                  onChange={(e) => setCurrentBanner({
                    ...currentBanner!,
                    position: parseInt(e.target.value) || 1
                  })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={currentBanner?.is_active || false}
                  onChange={(e) => setCurrentBanner({
                    ...currentBanner!,
                    is_active: e.target.checked
                  })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div>
                <Label htmlFor="image">Banner Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={300}
                      height={150}
                      className="rounded-md object-cover max-w-full h-auto"
                    />
                  </div>
                )}
                {currentBanner?.image_url && !imagePreview && (
                  <div className="mt-2">
                    <Image
                      src={currentBanner.image_url}
                      alt="Current banner"
                      width={300}
                      height={150}
                      className="rounded-md object-cover max-w-full h-auto"
                    />
                  </div>
                )}
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
                  ) : currentBanner?.id ? 'Update Banner' : 'Create Banner'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search banners..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBanners.length > 0 ? (
                filteredBanners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-16 w-24 flex-shrink-0">
                          <Image
                            src={banner.image_url || '/placeholder-banner.jpg'}
                            alt={banner.title}
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{banner.title}</div>
                          <div className="text-sm text-gray-500">
                            ID: {banner.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{banner.position}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        banner.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(banner.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No banners match your search.' : 'No banners found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}