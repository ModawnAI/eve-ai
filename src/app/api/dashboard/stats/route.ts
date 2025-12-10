import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get counts in parallel
    const [clientsResult, policiesResult, renewalsResult, documentsResult] = await Promise.all([
      supabase.from('clients').select('id', { count: 'exact', head: true }),
      supabase.from('policies').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('policies')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('expiration_date', new Date().toISOString().split('T')[0])
        .lte('expiration_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      supabase.from('documents').select('id', { count: 'exact', head: true }).eq('ai_processing_status', 'pending'),
    ]);

    // Calculate monthly premium
    const { data: premiumData } = await supabase
      .from('policies')
      .select('premium')
      .eq('status', 'active');

    const monthlyPremium = premiumData?.reduce((sum, policy) => {
      // Assuming premium is annual, divide by 12
      return sum + (Number(policy.premium) || 0) / 12;
    }, 0) || 0;

    return NextResponse.json({
      totalClients: clientsResult.count || 0,
      activePolicies: policiesResult.count || 0,
      pendingRenewals: renewalsResult.count || 0,
      pendingDocuments: documentsResult.count || 0,
      monthlyPremium: Math.round(monthlyPremium * 100) / 100,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
