import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-edge';

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    // Get all data needed for sync
    const [usersResult, updatesResult, configResult] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: true }),
      supabase
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
        .limit(100),
      supabase.from('heartbeat_config').select('*').single()
    ]);

    if (usersResult.error || updatesResult.error || configResult.error) {
      return NextResponse.json(
        { 
          error: 'Sync failed',
          details: {
            users: usersResult.error?.message,
            updates: updatesResult.error?.message,
            config: configResult.error?.message
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: usersResult.data,
      updates: updatesResult.data,
      config: configResult.data,
      synced_at: new Date().toISOString()
    });
  } catch (syncError) {
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const { action, data } = await request.json();

    switch (action) {
      case 'bulk_sync_updates':
        // Sync multiple updates from localStorage
        if (!Array.isArray(data)) {
          return NextResponse.json(
            { error: 'Data must be an array for bulk sync' },
            { status: 400 }
          );
        }

        interface LocalUpdate {
          user_id: string;
          content: string;
          emotion_type?: string;
          timestamp: string;
          is_read?: boolean;
        }

        const syncResults = await Promise.all(
          data.map(async (update: LocalUpdate) => {
            return supabase
              .from('updates')
              .insert({
                user_id: update.user_id,
                content: update.content,
                emotion_type: update.emotion_type || 'neutral',
                timestamp: update.timestamp,
                is_read: update.is_read || false
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
          })
        );

        const errors = syncResults.filter(result => result.error);
        const successes = syncResults.filter(result => !result.error);

        return NextResponse.json({
          synced: successes.length,
          errors: errors.length,
          results: successes.map(r => r.data)
        });

      default:
        return NextResponse.json(
          { error: 'Invalid sync action' },
          { status: 400 }
        );
    }
  } catch (syncError) {
    return NextResponse.json(
      { error: 'Failed to process sync request' },
      { status: 500 }
    );
  }
}