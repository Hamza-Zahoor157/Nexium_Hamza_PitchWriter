import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongo'
import Pitch from '@/models/Pitch'
import { getGPTPitch } from '@/lib/gpt' // Assuming you have this function

export async function POST(req: Request) {
  await connectDB()
  const { userId, idea } = await req.json()

  if (!userId || !idea) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Generate response using GPT or mock one
  const response = await getGPTPitch(idea)

  const pitch = await Pitch.create({ userId, idea, response })

  return NextResponse.json({ status: 'success', data: pitch })
}
