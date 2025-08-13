import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-edge';

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    const { data: updates, error } = await supabase
      .from('updates')
      .select(`
        *,
        users (
          id,
          name,
          display_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ updates });
  } catch (fetchError) {
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { user_id, content, emotion_type } = await request.json();

    if (!user_id || !content || !emotion_type) {
      return NextResponse.json(
        { error: 'user_id, content, and emotion_type are required' },
        { status: 400 }
      );
    }

    // Generate timestamp in HH:MM format
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const { data: update, error } = await supabase
      .from('updates')
      .insert({
        user_id,
        content,
        emotion_type,
        timestamp,
        is_read: false
      })
      .select(`
        *,
        users (
          id,
          name,
          display_name
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ update }, { status: 201 });
  } catch (createError) {
    return NextResponse.json(
      { error: 'Failed to create update' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { updateIds, markAsRead } = await request.json();

    if (!Array.isArray(updateIds)) {
      return NextResponse.json(
        { error: 'updateIds must be an array' },
        { status: 400 }
      );
    }

    const { data: updates, error } = await supabase
      .from('updates')
      .update({ is_read: markAsRead })
      .in('id', updateIds)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ updates });
  } catch (updateError) {
    return NextResponse.json(
      { error: 'Failed to update updates' },
      { status: 500 }
    );
  }
}