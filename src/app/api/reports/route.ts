import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// GET - Fetch report data based on type
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency
    const { data: profile } = await supabase
      .from('users')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('type') || 'overview';
    const timeRange = searchParams.get('timeRange') || 'month';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    switch (reportType) {
      case 'overview':
        return await getOverviewReport(supabase, profile.agency_id, startDate);
      case 'expirations':
        return await getExpirationsReport(supabase, profile.agency_id);
      case 'commissions':
        return await getCommissionsReport(supabase, profile.agency_id, startDate);
      case 'production':
        return await getProductionReport(supabase, profile.agency_id, startDate);
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getOverviewReport(supabase: Awaited<ReturnType<typeof createClient>>, agencyId: string, startDate: Date) {
  // Get total policies count
  const { count: totalPolicies } = await supabase
    .from('policies')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .eq('status', 'active');

  // Get active clients count
  const { count: activeClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId);

  // Get policies expiring this month
  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  const { count: expiringThisMonth } = await supabase
    .from('policies')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .eq('status', 'active')
    .gte('expiration_date', new Date().toISOString().split('T')[0])
    .lte('expiration_date', endOfMonth.toISOString().split('T')[0]);

  // Get total premium for active policies
  const { data: premiumData } = await supabase
    .from('policies')
    .select('premium')
    .eq('agency_id', agencyId)
    .eq('status', 'active');

  const totalPremium = premiumData?.reduce((sum, p) => sum + (p.premium || 0), 0) || 0;
  // Estimate commissions at 10% average
  const monthlyCommissions = totalPremium * 0.10 / 12;

  // Get previous period counts for comparison (simplified)
  const previousStartDate = new Date(startDate.getTime() - (new Date().getTime() - startDate.getTime()));

  const { count: previousPolicies } = await supabase
    .from('policies')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .lte('created_at', startDate.toISOString());

  const policiesChange = previousPolicies && previousPolicies > 0
    ? ((totalPolicies || 0) - previousPolicies) / previousPolicies * 100
    : 0;

  return NextResponse.json({
    overview: {
      totalPolicies: totalPolicies || 0,
      policiesChange: Math.round(policiesChange * 10) / 10,
      activeClients: activeClients || 0,
      clientsChange: 8.3, // Placeholder - would need historical data
      monthlyCommissions: Math.round(monthlyCommissions * 100) / 100,
      commissionsChange: 15.2, // Placeholder
      expiringThisMonth: expiringThisMonth || 0,
      expiringChange: -5.1, // Placeholder
    },
  });
}

async function getExpirationsReport(supabase: Awaited<ReturnType<typeof createClient>>, agencyId: string) {
  // Get policies expiring in the next 60 days
  const today = new Date();
  const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

  const { data: expiringPolicies, error } = await supabase
    .from('policies')
    .select(`
      id,
      policy_number,
      line_of_business,
      expiration_date,
      premium,
      status,
      client:clients(id, first_name, last_name, business_name, type),
      carrier:carriers(id, name)
    `)
    .eq('agency_id', agencyId)
    .eq('status', 'active')
    .gte('expiration_date', today.toISOString().split('T')[0])
    .lte('expiration_date', sixtyDaysFromNow.toISOString().split('T')[0])
    .order('expiration_date', { ascending: true });

  if (error) {
    console.error('Error fetching expiring policies:', error);
    return NextResponse.json({ error: 'Failed to fetch expiring policies' }, { status: 500 });
  }

  // Transform data for frontend
  const formattedPolicies = expiringPolicies?.map((policy) => {
    const client = policy.client as { first_name: string | null; last_name: string | null; business_name: string | null; type: string } | null;
    const carrier = policy.carrier as { name: string } | null;
    const expirationDate = new Date(policy.expiration_date!);
    const daysUntilExpiry = Math.ceil((expirationDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

    return {
      id: policy.id,
      policyNumber: policy.policy_number,
      clientName: client?.type === 'business'
        ? client?.business_name
        : `${client?.first_name || ''} ${client?.last_name || ''}`.trim(),
      type: policy.line_of_business,
      carrier: carrier?.name || 'Unknown',
      expirationDate: policy.expiration_date,
      premium: policy.premium || 0,
      daysUntilExpiry,
    };
  }) || [];

  return NextResponse.json({ expiringPolicies: formattedPolicies });
}

async function getCommissionsReport(supabase: Awaited<ReturnType<typeof createClient>>, agencyId: string, startDate: Date) {
  // Get policies created/renewed in the time range
  const { data: policies, error } = await supabase
    .from('policies')
    .select(`
      id,
      policy_number,
      line_of_business,
      premium,
      status,
      created_at,
      client:clients(id, first_name, last_name, business_name, type),
      carrier:carriers(id, name)
    `)
    .eq('agency_id', agencyId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching commission data:', error);
    return NextResponse.json({ error: 'Failed to fetch commission data' }, { status: 500 });
  }

  // Commission rates by line of business (simplified)
  const commissionRates: Record<string, number> = {
    'health': 10,
    'life': 50,
    'personal_auto': 12,
    'homeowners': 15,
    'commercial': 12,
    'other': 10,
  };

  // Transform data with commission calculations
  const commissionData = policies?.map((policy) => {
    const client = policy.client as { first_name: string | null; last_name: string | null; business_name: string | null; type: string } | null;
    const carrier = policy.carrier as { name: string } | null;
    const rate = commissionRates[policy.line_of_business] || 10;
    const commission = (policy.premium || 0) * (rate / 100);

    // Simulate payment status based on creation date
    const createdDate = new Date(policy.created_at);
    const daysSinceCreation = Math.floor((new Date().getTime() - createdDate.getTime()) / (24 * 60 * 60 * 1000));
    let status: 'paid' | 'pending' | 'processing';
    let paidDate: string | null = null;

    if (daysSinceCreation > 30) {
      status = 'paid';
      paidDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (daysSinceCreation > 14) {
      status = 'processing';
    } else {
      status = 'pending';
    }

    return {
      id: policy.id,
      policyNumber: policy.policy_number,
      clientName: client?.type === 'business'
        ? client?.business_name
        : `${client?.first_name || ''} ${client?.last_name || ''}`.trim(),
      carrier: carrier?.name || 'Unknown',
      type: policy.line_of_business,
      premium: policy.premium || 0,
      commissionRate: rate,
      commission: Math.round(commission * 100) / 100,
      status,
      paidDate,
    };
  }) || [];

  // Calculate summary stats
  const totalEarned = commissionData
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.commission, 0);
  const pendingPayment = commissionData
    .filter((c) => c.status !== 'paid')
    .reduce((sum, c) => sum + c.commission, 0);
  const avgRate = commissionData.length > 0
    ? commissionData.reduce((sum, c) => sum + c.commissionRate, 0) / commissionData.length
    : 0;

  return NextResponse.json({
    commissions: commissionData,
    summary: {
      totalEarned: Math.round(totalEarned * 100) / 100,
      pendingPayment: Math.round(pendingPayment * 100) / 100,
      avgRate: Math.round(avgRate * 10) / 10,
      totalPolicies: commissionData.length,
    },
  });
}

async function getProductionReport(supabase: Awaited<ReturnType<typeof createClient>>, agencyId: string, startDate: Date) {
  // Get new policies in time range
  const { data: newPolicies } = await supabase
    .from('policies')
    .select('id, premium, line_of_business')
    .eq('agency_id', agencyId)
    .gte('created_at', startDate.toISOString())
    .in('status', ['active', 'pending']);

  // Get all active policies for retention calculation
  const { count: totalActive } = await supabase
    .from('policies')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .eq('status', 'active');

  const { count: totalCancelled } = await supabase
    .from('policies')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .in('status', ['cancelled', 'non_renewed'])
    .gte('updated_at', startDate.toISOString());

  // Calculate new business vs renewals (simplified - in real app would need more data)
  const newBusinessCount = newPolicies?.length || 0;
  const newBusinessPremium = newPolicies?.reduce((sum, p) => sum + (p.premium || 0), 0) || 0;

  // Assume 70% are renewals for demo purposes
  const renewalCount = Math.round(newBusinessCount * 0.7);
  const renewalPremium = Math.round(newBusinessPremium * 0.7);
  const actualNewCount = newBusinessCount - renewalCount;
  const actualNewPremium = newBusinessPremium - renewalPremium;

  // Calculate retention rate
  const totalPolicies = (totalActive || 0) + (totalCancelled || 0);
  const retentionRate = totalPolicies > 0
    ? ((totalActive || 0) / totalPolicies) * 100
    : 100;

  // Production by type
  const productionByType: Record<string, { count: number; premium: number }> = {};
  newPolicies?.forEach((policy) => {
    if (!productionByType[policy.line_of_business]) {
      productionByType[policy.line_of_business] = { count: 0, premium: 0 };
    }
    productionByType[policy.line_of_business].count++;
    productionByType[policy.line_of_business].premium += policy.premium || 0;
  });

  const totalProduction = Object.values(productionByType).reduce((sum, p) => sum + p.premium, 0);
  const productionByTypeFormatted = Object.entries(productionByType).map(([type, data]) => ({
    type,
    count: data.count,
    premium: data.premium,
    percentage: totalProduction > 0 ? Math.round((data.premium / totalProduction) * 100) : 0,
  }));

  return NextResponse.json({
    production: {
      newBusiness: {
        count: actualNewCount,
        premium: actualNewPremium,
        change: 18.5, // Placeholder
      },
      renewals: {
        count: renewalCount,
        premium: renewalPremium,
        change: 8.2, // Placeholder
      },
      lapsed: {
        count: totalCancelled || 0,
        premium: 0, // Would need to track this
        change: -15.3, // Placeholder
      },
      retentionRate: Math.round(retentionRate * 10) / 10,
      productionByType: productionByTypeFormatted,
    },
  });
}
