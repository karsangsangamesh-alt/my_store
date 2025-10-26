import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching banners:', error)
      return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/banners:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    let image_url = ''

    // Upload image if provided
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
    }

    const { data, error } = await supabase
      .from('banners')
      .insert([{
        title,
        image_url,
        position,
        is_active
      }])
      .select()

    if (error) {
      console.error('Error creating banner:', error)
      return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error in POST /api/banners:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
