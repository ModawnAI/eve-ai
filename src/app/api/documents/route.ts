import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Enums, InsertTables } from '@/types/database';

const validDocumentTypes: Enums<'document_type'>[] = ['id_card', 'dec_page', 'application', 'endorsement', 'cancellation', 'invoice', 'claim', 'other'];
const validAiStatuses = ['pending', 'processing', 'completed', 'failed'] as const;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const aiStatus = searchParams.get('aiStatus') || '';
    const clientId = searchParams.get('clientId') || '';
    const policyId = searchParams.get('policyId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('documents')
      .select(`
        *,
        client:clients(id, first_name, last_name, business_name),
        policy:policies(id, policy_number)
      `, { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (type && type !== 'all' && validDocumentTypes.includes(type as Enums<'document_type'>)) {
      query = query.eq('type', type as Enums<'document_type'>);
    }

    if (aiStatus && aiStatus !== 'all' && validAiStatuses.includes(aiStatus as typeof validAiStatuses[number])) {
      query = query.eq('ai_processing_status', aiStatus as typeof validAiStatuses[number]);
    }

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (policyId) {
      query = query.eq('policy_id', policyId);
    }

    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: documents, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      documents,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to get agency_id
    const { data: profile } = await supabase
      .from('users')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 400 });
    }

    const body: Partial<InsertTables<'documents'>> = await request.json();

    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        ...body,
        agency_id: profile.agency_id,
        created_by: user.id,
        ai_processing_status: 'pending',
      } as InsertTables<'documents'>)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
