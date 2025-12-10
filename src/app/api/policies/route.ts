import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Enums, InsertTables } from '@/types/database';

const validPolicyStatuses: Enums<'policy_status'>[] = ['quote', 'pending', 'active', 'cancelled', 'expired', 'non_renewed'];
const validLinesOfBusiness: Enums<'line_of_business'>[] = ['personal_auto', 'homeowners', 'commercial', 'health', 'life', 'other'];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const lob = searchParams.get('lob') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('policies')
      .select(`
        *,
        client:clients(id, first_name, last_name, business_name, type),
        carrier:carriers(id, name)
      `, { count: 'exact' });

    if (search) {
      query = query.or(`policy_number.ilike.%${search}%`);
    }

    if (status && status !== 'all' && validPolicyStatuses.includes(status as Enums<'policy_status'>)) {
      query = query.eq('status', status as Enums<'policy_status'>);
    }

    if (lob && lob !== 'all' && validLinesOfBusiness.includes(lob as Enums<'line_of_business'>)) {
      query = query.eq('line_of_business', lob as Enums<'line_of_business'>);
    }

    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: policies, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      policies,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
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

    const body: Partial<InsertTables<'policies'>> = await request.json();

    const { data: policy, error } = await supabase
      .from('policies')
      .insert({
        ...body,
        agency_id: profile.agency_id,
      } as InsertTables<'policies'>)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ policy }, { status: 201 });
  } catch (error) {
    console.error('Error creating policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
