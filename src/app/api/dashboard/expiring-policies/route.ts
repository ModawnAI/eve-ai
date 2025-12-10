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
    const limit = parseInt(searchParams.get('limit') || '5');
    const days = parseInt(searchParams.get('days') || '30');

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: policies, error } = await supabase
      .from('policies')
      .select(`
        id,
        policy_number,
        line_of_business,
        premium,
        expiration_date,
        client:clients(id, first_name, last_name, business_name, type)
      `)
      .eq('status', 'active')
      .gte('expiration_date', today)
      .lte('expiration_date', futureDate)
      .order('expiration_date', { ascending: true })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate days until expiration
    const policiesWithDays = policies?.map(policy => ({
      ...policy,
      daysUntilExpiration: policy.expiration_date
        ? Math.ceil((new Date(policy.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
    }));

    return NextResponse.json({ policies: policiesWithDays });
  } catch (error) {
    console.error('Error fetching expiring policies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
