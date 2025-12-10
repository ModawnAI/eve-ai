import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// GET - Fetch all team members for the agency
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency and verify admin role
    const { data: profile } = await supabase
      .from('users')
      .select('agency_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 400 });
    }

    // Only admins can view user list
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get all users in the agency
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, phone, avatar_url, is_active, created_at, updated_at')
      .eq('agency_id', profile.agency_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Transform users for frontend (mapping role to include 'owner' for first admin)
    const transformedUsers = users?.map((u, index) => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: index === 0 && u.role === 'admin' ? 'owner' : u.role,
      status: u.is_active ? 'active' : 'inactive',
      avatar: u.avatar_url,
      lastLogin: u.updated_at, // Using updated_at as proxy for last login
      createdAt: u.created_at,
    })) || [];

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Invite a new user to the agency
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency and verify admin role
    const { data: profile } = await supabase
      .from('users')
      .select('agency_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 400 });
    }

    // Only admins can invite users
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { email, name, role } = body as {
      email: string;
      name: string;
      role: 'admin' | 'agent' | 'staff';
    };

    // Validate input
    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists in agency
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('agency_id', profile.agency_id)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists in this agency' }, { status: 400 });
    }

    // In a real implementation, this would:
    // 1. Create an invitation record
    // 2. Send an email invitation
    // 3. Create the user when they accept the invitation

    // For now, we'll create a placeholder user record
    // Note: In production, you'd use Supabase Auth Admin API to invite users

    // Create a pending user record (in real app, this would be an invitation)
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        agency_id: profile.agency_id,
        email,
        full_name: name,
        role,
        is_active: false, // Pending until they accept invitation
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json({ error: 'Failed to create user invitation' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        status: 'pending',
        createdAt: newUser.created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error inviting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a user's role or status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency and verify admin role
    const { data: profile } = await supabase
      .from('users')
      .select('agency_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 400 });
    }

    // Only admins can update users
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role, isActive } = body as {
      userId: string;
      role?: 'admin' | 'agent' | 'staff';
      isActive?: boolean;
    };

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify target user belongs to same agency
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, agency_id')
      .eq('id', userId)
      .eq('agency_id', profile.agency_id)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-demotion from admin
    if (userId === user.id && role && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot change your own admin role' }, { status: 400 });
    }

    // Build update object
    const updates: { role?: 'admin' | 'agent' | 'staff'; is_active?: boolean } = {};
    if (role) updates.role = role;
    if (typeof isActive === 'boolean') updates.is_active = isActive;

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.is_active ? 'active' : 'inactive',
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a user from the agency
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency and verify admin role
    const { data: profile } = await supabase
      .from('users')
      .select('agency_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 400 });
    }

    // Only admins can delete users
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Verify target user belongs to same agency
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, agency_id, role')
      .eq('id', userId)
      .eq('agency_id', profile.agency_id)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if this is the only admin (don't allow deletion)
    if (targetUser.role === 'admin') {
      const { count: adminCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('agency_id', profile.agency_id)
        .eq('role', 'admin');

      if (adminCount && adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot delete the last admin' }, { status: 400 });
      }
    }

    // Delete the user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
