import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongo'
import Pitch from '@/models/Pitch'
import { getGPTPitch } from '@/lib/gpt'
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

  await connectDB()

  const { idea } = await req.json()

  if (!idea) {
    return NextResponse.json({ error: 'Missing idea' }, { status: 400 })
  }

  const response = await getGPTPitch(idea)

  const pitch = await Pitch.create({ userId: user.id, idea, response })

  return NextResponse.json({ status: 'success', data: pitch })
}
