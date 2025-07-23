import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongo'
import Pitch from '@/models/Pitch'
import { getGPTPitch } from '@/ai/gpt'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id: userId } = await params

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const pitches = await Pitch.find({ userId }).sort({ createdAt: -1 })

    return NextResponse.json({ status: 'success', pitches })
  } catch (error) {
    console.error('Error fetching pitches:', error)
    return NextResponse.json({ error: 'Failed to fetch pitches' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { userId, idea } = await req.json()

    if (!userId || !idea) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const response = await getGPTPitch(idea)

    const pitch = await Pitch.create({ userId, idea, response })

    return NextResponse.json({ status: 'success', data: pitch })
  } catch (error) {
    console.error('Error creating pitch:', error)
    return NextResponse.json({ error: 'Failed to create pitch' }, { status: 500 })
  }
}
