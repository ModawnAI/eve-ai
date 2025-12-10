import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Json } from '@/types/database';

// Integration types
export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'carriers' | 'marketplaces' | 'crm' | 'communication';
  connected: boolean;
  lastSync?: string;
  status?: 'active' | 'inactive' | 'error' | 'syncing';
  config?: Record<string, unknown>;
}

// Default integrations available in the system
const defaultIntegrations: Omit<Integration, 'connected' | 'lastSync' | 'status' | 'config'>[] = [
  {
    id: 'ivans',
    name: 'IVANS',
    description: 'Insurance industry standard for carrier downloads and messages',
    category: 'carriers',
  },
  {
    id: 'healthsherpa',
    name: 'HealthSherpa',
    description: 'Health insurance marketplace enrollment platform',
    category: 'marketplaces',
  },
  {
    id: 'covered-ca',
    name: 'Covered California',
    description: 'California state health insurance marketplace',
    category: 'marketplaces',
  },
  {
    id: 'medicare',
    name: 'Medicare.gov',
    description: 'Federal Medicare enrollment and plan comparison',
    category: 'marketplaces',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'CRM platform for customer relationship management',
    category: 'crm',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing, sales, and service CRM platform',
    category: 'crm',
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS and voice communication platform',
    category: 'communication',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing platform',
    category: 'communication',
  },
];

// GET - Fetch all integrations with their connection status
export async function GET() {
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

    // Get agency settings which contains integration configs
    const { data: agency } = await supabase
      .from('agencies')
      .select('settings')
      .eq('id', profile.agency_id)
      .single();

    const agencyIntegrations = (agency?.settings as Record<string, unknown>)?.integrations as Record<string, Integration> || {};

    // Merge default integrations with agency-specific settings
    const integrations: Integration[] = defaultIntegrations.map((defaultInt) => {
      const agencyConfig = agencyIntegrations[defaultInt.id];
      return {
        ...defaultInt,
        connected: agencyConfig?.connected || false,
        lastSync: agencyConfig?.lastSync,
        status: agencyConfig?.status || 'inactive',
        config: agencyConfig?.config,
      };
    });

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Connect/update an integration
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency
    const { data: profile } = await supabase
      .from('users')
      .select('agency_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'No agency found' }, { status: 400 });
    }

    // Only admins can manage integrations
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { integrationId, action, config } = body as {
      integrationId: string;
      action: 'connect' | 'disconnect' | 'sync' | 'configure';
      config?: Record<string, unknown>;
    };

    // Validate integration exists
    const defaultInt = defaultIntegrations.find((i) => i.id === integrationId);
    if (!defaultInt) {
      return NextResponse.json({ error: 'Invalid integration' }, { status: 400 });
    }

    // Get current agency settings
    const { data: agency } = await supabase
      .from('agencies')
      .select('settings')
      .eq('id', profile.agency_id)
      .single();

    const currentSettings = (agency?.settings as Record<string, unknown>) || {};
    const currentIntegrations = (currentSettings.integrations as Record<string, Integration>) || {};

    let updatedIntegration: Partial<Integration>;

    switch (action) {
      case 'connect':
        updatedIntegration = {
          connected: true,
          status: 'active',
          lastSync: new Date().toISOString(),
          config: config || currentIntegrations[integrationId]?.config,
        };
        break;
      case 'disconnect':
        updatedIntegration = {
          connected: false,
          status: 'inactive',
          config: undefined,
        };
        break;
      case 'sync':
        if (!currentIntegrations[integrationId]?.connected) {
          return NextResponse.json({ error: 'Integration not connected' }, { status: 400 });
        }
        updatedIntegration = {
          ...currentIntegrations[integrationId],
          status: 'syncing',
        };
        // Simulate sync completion after a delay (in real implementation, this would be async)
        setTimeout(async () => {
          const supabaseUpdate = await createClient();
          const { data: latestAgency } = await supabaseUpdate
            .from('agencies')
            .select('settings')
            .eq('id', profile.agency_id)
            .single();

          const latestSettings = (latestAgency?.settings as Record<string, unknown>) || {};
          const latestIntegrations = (latestSettings.integrations as Record<string, Integration>) || {};

          latestIntegrations[integrationId] = {
            ...latestIntegrations[integrationId],
            status: 'active',
            lastSync: new Date().toISOString(),
          };

          await supabaseUpdate
            .from('agencies')
            .update({
              settings: {
                ...latestSettings,
                integrations: latestIntegrations,
              } as unknown as Json,
            })
            .eq('id', profile.agency_id);
        }, 3000);
        break;
      case 'configure':
        updatedIntegration = {
          ...currentIntegrations[integrationId],
          config: config,
        };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update agency settings with new integration config
    const updatedIntegrations = {
      ...currentIntegrations,
      [integrationId]: {
        ...currentIntegrations[integrationId],
        ...updatedIntegration,
      },
    };

    const { error: updateError } = await supabase
      .from('agencies')
      .update({
        settings: {
          ...currentSettings,
          integrations: updatedIntegrations,
        } as unknown as Json,
      })
      .eq('id', profile.agency_id);

    if (updateError) {
      console.error('Error updating integration:', updateError);
      return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      integration: {
        ...defaultInt,
        ...updatedIntegrations[integrationId],
      },
    });
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
