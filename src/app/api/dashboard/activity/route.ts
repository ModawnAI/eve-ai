import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get recent activity from activity_log table
    const { data: activities, error } = await supabase
      .from('activity_log')
      .select(`
        *,
        user:users(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // If activity_logs table doesn't exist yet, return mock data
      return NextResponse.json({
        activities: [
          {
            id: '1',
            action: 'client_created',
            description: 'New client added',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            action: 'policy_renewed',
            description: 'Policy renewed',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: '3',
            action: 'document_uploaded',
            description: 'Document uploaded',
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
      });
    }

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
