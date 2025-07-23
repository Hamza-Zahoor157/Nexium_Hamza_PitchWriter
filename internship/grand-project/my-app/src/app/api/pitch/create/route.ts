import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongo'
import Pitch from '@/models/Pitch'
import { generatePitch, type PitchResponse, isValidPitchResponse } from '@/ai/n8n-chat'
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
    await connectDB();

    const { idea, response: pitchResponse } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: 'Missing idea' }, { status: 400 });
    }

    let response: PitchResponse;
    
    // If pitchResponse is provided, validate it
    if (pitchResponse) {
      if (!isValidPitchResponse(pitchResponse)) {
        console.error('Invalid pitch response format:', pitchResponse);
        return NextResponse.json({ error: 'Invalid pitch response format' }, { status: 400 });
      }
      response = pitchResponse;
    } else {
      // Generate new pitch
      console.log('Generating new pitch for idea:', idea);
      const generatedResponse = await generatePitch(idea);
      if (!generatedResponse) {
        throw new Error('Failed to generate pitch');
      }
      response = generatedResponse;
    }

    // Create pitch document
    const pitch = await Pitch.create({ 
      userId: user.id, 
      idea, 
      response,
      createdAt: new Date()
    });

    return NextResponse.json({ 
      status: 'success', 
      data: {
        _id: pitch._id.toString(),
        userId: pitch.userId,
        idea: pitch.idea,
        response: pitch.response,
        createdAt: pitch.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in pitch creation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}