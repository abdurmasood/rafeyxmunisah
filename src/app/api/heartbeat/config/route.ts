import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: config, error } = await supabase
      .from('heartbeat_config')
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ config });
  } catch (fetchError) {
    return NextResponse.json(
      { error: 'Failed to fetch heartbeat config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { start_date } = await request.json();

    if (!start_date) {
      return NextResponse.json(
        { error: 'start_date is required' },
        { status: 400 }
      );
    }

    // First, try to get existing config
    const { data: existingConfig } = await supabase
      .from('heartbeat_config')
      .select('id')
      .single();

    let result;
    if (existingConfig) {
      // Update existing config
      result = await supabase
        .from('heartbeat_config')
        .update({ 
          start_date, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingConfig.id)
        .select()
        .single();
    } else {
      // Insert new config
      result = await supabase
        .from('heartbeat_config')
        .insert({ start_date })
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ config: result.data });
  } catch (updateError) {
    return NextResponse.json(
      { error: 'Failed to update heartbeat config' },
      { status: 500 }
    );
  }
}