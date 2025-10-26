import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching banner:', error)
      return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/banners/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()

    const title = formData.get('title') as string
    const position = parseInt(formData.get('position') as string) || 0
    const is_active = formData.get('is_active') === 'true'
    const imageFile = formData.get('image') as File

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // First, get the existing banner to preserve the image URL if no new image is uploaded
    const { data: existingBanner, error: fetchError } = await supabase
      .from('banners')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      console.error('Error fetching existing banner:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 })
    }

    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    let image_url = existingBanner.image_url

    // Upload new image if provided
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `banners/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile)

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      image_url = publicUrl

      // Delete old image if it exists and is not a default/placeholder image
      if (existingBanner.image_url && !existingBanner.image_url.includes('unsplash.com')) {
        const oldPath = existingBanner.image_url.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('images')
            .remove([`banners/${oldPath}`])
        }
      }
    }

    const { data, error } = await supabase
      .from('banners')
      .update({
        title,
        image_url,
        position,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()

    if (error) {
      console.error('Error updating banner:', error)
      return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in PUT /api/banners/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // First, get the existing banner to get the image URL for deletion
    const { data: existingBanner, error: fetchError } = await supabase
      .from('banners')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      console.error('Error fetching existing banner:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 })
    }

    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    // Delete the banner from database
    const { error: deleteError } = await supabase
      .from('banners')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting banner:', deleteError)
      return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
    }

    // Delete image from storage if it's not a default/placeholder image
    if (existingBanner.image_url && !existingBanner.image_url.includes('unsplash.com')) {
      const filePath = existingBanner.image_url.split('/').pop()
      if (filePath) {
        await supabase.storage
          .from('images')
          .remove([`banners/${filePath}`])
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/banners/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
