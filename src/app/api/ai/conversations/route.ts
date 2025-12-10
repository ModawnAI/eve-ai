import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// GET - List all conversations for the user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get conversations with the last message
    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select(`
        id,
        title,
        context_type,
        context_id,
        created_at,
        updated_at,
        messages:ai_messages(
          id,
          content,
          role,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format conversations with last message
    const formattedConversations = conversations?.map(conv => {
      const messages = conv.messages || [];
      const lastMessage = messages.length > 0
        ? messages.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
        : null;

      return {
        id: conv.id,
        title: conv.title || 'New Conversation',
        context_type: conv.context_type,
        context_id: conv.context_id,
        lastMessage: lastMessage?.content?.substring(0, 100) || '',
        lastMessageRole: lastMessage?.role || null,
        messageCount: messages.length,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
      };
    });

    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, contextType, contextId } = body;

    const { data: conversation, error } = await supabase
      .from('ai_conversations')
      .insert({
        agency_id: userData.agency_id,
        user_id: user.id,
        title: title || 'New Conversation',
        context_type: contextType || 'general',
        context_id: contextId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
