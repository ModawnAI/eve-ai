'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Plugs,
  Check,
  X,
  Gear,
  ArrowsClockwise,
  CaretRight,
  Buildings,
  ShoppingCart,
  UsersThree,
  ChatCircle,
  CircleNotch,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'carriers' | 'marketplaces' | 'crm' | 'communication';
  connected: boolean;
  lastSync?: string;
  status?: 'active' | 'inactive' | 'error' | 'syncing';
  config?: Record<string, unknown>;
}

// Logo mapping for integrations
const integrationLogos: Record<string, string> = {
  ivans: '📄',
  healthsherpa: '🏥',
  'covered-ca': '🐻',
  medicare: '🏛️',
  salesforce: '☁️',
  hubspot: '🧡',
  twilio: '📱',
  sendgrid: '📧',
};

const categoryIcons = {
  carriers: Buildings,
  marketplaces: ShoppingCart,
  crm: UsersThree,
  communication: ChatCircle,
};

export default function IntegrationsPage() {
  const t = useTranslations('integrations');
  const [integrations, setIntegrations] = React.useState<Integration[]>([]);
  const [loading, setLoading] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch integrations on mount
  React.useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      if (!response.ok) throw new Error('Failed to fetch integrations');
      const data = await response.json();
      setIntegrations(data.integrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (integrationId: string) => {
    setLoading(integrationId);
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId, action: 'connect' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to connect');
      }

      const data = await response.json();
      setIntegrations((prev) =>
        prev.map((i) => (i.id === integrationId ? { ...i, ...data.integration } : i))
      );
      toast.success(`Connected to ${integrations.find((i) => i.id === integrationId)?.name}`);
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect');
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setLoading(integrationId);
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId, action: 'disconnect' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disconnect');
      }

      const data = await response.json();
      setIntegrations((prev) =>
        prev.map((i) => (i.id === integrationId ? { ...i, ...data.integration } : i))
      );
      toast.success(`Disconnected from ${integrations.find((i) => i.id === integrationId)?.name}`);
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to disconnect');
    } finally {
      setLoading(null);
    }
  };

  const handleSync = async (integrationId: string) => {
    setLoading(integrationId);

    // Update UI immediately to show syncing
    setIntegrations((prev) =>
      prev.map((i) => (i.id === integrationId ? { ...i, status: 'syncing' } : i))
    );

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId, action: 'sync' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync');
      }

      toast.success('Sync started successfully');

      // Refetch after a delay to get updated status
      setTimeout(async () => {
        await fetchIntegrations();
        setLoading(null);
      }, 3500);
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sync');
      setLoading(null);
      // Revert status on error
      setIntegrations((prev) =>
        prev.map((i) => (i.id === integrationId ? { ...i, status: 'active' } : i))
      );
    }
  };

  const formatLastSync = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const groupedIntegrations = integrations.reduce(
    (acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = [];
      }
      acc[integration.category].push(integration);
      return acc;
    },
    {} as Record<string, Integration[]>
  );

  const connectedCount = integrations.filter((i) => i.connected).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircleNotch className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Check className="mr-1 h-3 w-3" />
            {connectedCount} {t('connected')}
          </Badge>
        </div>
      </div>

      {/* Integration Categories */}
      {(Object.keys(groupedIntegrations) as Array<keyof typeof categoryIcons>).map((category) => {
        const CategoryIcon = categoryIcons[category];
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <CategoryIcon className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">{t(`categories.${category}`)}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {groupedIntegrations[category].map((integration) => (
                <Card key={integration.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-2xl">
                          {integrationLogos[integration.id] || '🔌'}
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                      {integration.connected ? (
                        <Badge variant="default" className="bg-green-500">
                          <Check className="mr-1 h-3 w-3" />
                          {t('status.active')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <X className="mr-1 h-3 w-3" />
                          {t('status.inactive')}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4">
                    {integration.connected ? (
                      <div className="space-y-3">
                        {integration.lastSync && (
                          <p className="text-xs text-muted-foreground">
                            {t('lastSync')}: {formatLastSync(integration.lastSync)}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(integration.id)}
                            disabled={loading === integration.id || integration.status === 'syncing'}
                          >
                            <ArrowsClockwise
                              className={`mr-1 h-4 w-4 ${integration.status === 'syncing' || loading === integration.id ? 'animate-spin' : ''}`}
                            />
                            {integration.status === 'syncing' ? t('status.syncing') : 'Sync'}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Gear className="mr-1 h-4 w-4" />
                            {t('configure')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDisconnect(integration.id)}
                            disabled={loading === integration.id}
                          >
                            {t('disconnect')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleConnect(integration.id)}
                        disabled={loading === integration.id}
                        className="w-full"
                      >
                        {loading === integration.id ? (
                          <ArrowsClockwise className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plugs className="mr-2 h-4 w-4" />
                        )}
                        {t('connect')}
                        <CaretRight className="ml-auto h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
