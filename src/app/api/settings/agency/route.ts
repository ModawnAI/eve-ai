import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency_id first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('agency_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: agency, error } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', userData.agency_id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ agency });
  } catch (error) {
    console.error('Error fetching agency:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency_id and role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('agency_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only admins can update agency settings
    if (userData.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can update agency settings' }, { status: 403 });
    }

    const body = await request.json();

    // Only allow updating certain fields with proper types
    const updateData: {
      name?: string;
      license_number?: string | null;
      phone?: string | null;
      email?: string | null;
      address?: string | null;
      city?: string | null;
      state?: string | null;
      zip_code?: string | null;
      website?: string | null;
    } = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.license_number !== undefined) updateData.license_number = body.license_number;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zip_code !== undefined) updateData.zip_code = body.zip_code;
    if (body.website !== undefined) updateData.website = body.website;

    const { data: agency, error } = await supabase
      .from('agencies')
      .update(updateData)
      .eq('id', userData.agency_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ agency });
  } catch (error) {
    console.error('Error updating agency:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
