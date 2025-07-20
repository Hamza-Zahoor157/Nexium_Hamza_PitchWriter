import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongo'
import Pitch from '@/models/Pitch'
import { generatePitch } from '@/lib/n8n-chat'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const { idea, response: pitchResponse } = await req.json()

    if (!idea) {
      return NextResponse.json({ error: 'Missing idea' }, { status: 400 })
    }

    // If pitchResponse is already provided (from frontend), use it
    // Otherwise, generate a new pitch (fallback)
    const response = pitchResponse || await generatePitch(idea)

    if (!response) {
      throw new Error('Failed to generate pitch')
    }

    const pitch = await Pitch.create({ 
      userId: user.id, 
      idea, 
      response,
      createdAt: new Date()
    })

    return NextResponse.json({ 
      status: 'success', 
      data: {
        _id: pitch._id.toString(),
        idea: pitch.idea,
        response: pitch.response,
        createdAt: pitch.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error in pitch creation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
