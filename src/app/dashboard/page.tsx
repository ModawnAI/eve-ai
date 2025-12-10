'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Users,
  FileText,
  Folder,
  Clock,
  TrendUp,
  Warning,
  UserPlus,
  FilePlus,
  ArrowsClockwise,
  Robot,
} from '@phosphor-icons/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Enums } from '@/types/database';

interface DashboardStats {
  totalClients: number;
  activePolicies: number;
  pendingRenewals: number;
  pendingDocuments: number;
  monthlyPremium: number;
}

interface Activity {
  id: string;
  action: string;
  description: string;
  created_at: string;
  user?: {
    full_name: string | null;
  } | null;
}

interface ExpiringPolicy {
  id: string;
  policy_number: string;
  line_of_business: Enums<'line_of_business'>;
  premium: number;
  expiration_date: string;
  daysUntilExpiration: number | null;
  client: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    type: Enums<'client_type'>;
  } | null;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function StatCard({ title, value, description, icon, loading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'client_created':
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case 'policy_renewed':
    case 'policy_created':
      return <ArrowsClockwise className="h-4 w-4 text-green-500" />;
    case 'document_uploaded':
      return <FilePlus className="h-4 w-4 text-purple-500" />;
    case 'ai_processed':
      return <Robot className="h-4 w-4 text-amber-500" />;
    default:
      return <div className="h-2 w-2 rounded-full bg-primary" />;
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getClientName(client: ExpiringPolicy['client']): string {
  if (!client) return 'Unknown';
  if (client.type === 'business') {
    return client.business_name || 'Unknown Business';
  }
  return [client.first_name, client.last_name].filter(Boolean).join(' ') || 'Unknown';
}

function getLobLabel(lob: Enums<'line_of_business'>, t: ReturnType<typeof useTranslations>): string {
  // Map lob to translation key
  const lobMap: Record<string, string> = {
    personal_auto: 'personalAuto',
    homeowners: 'homeowners',
    commercial: 'commercial',
    health: 'health',
    life: 'life',
  };
  const translationKey = lobMap[lob] || lob;
  return t(`policies.lob.${translationKey}` as Parameters<typeof t>[0]);
}

export default function DashboardPage() {
  const t = useTranslations();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expiringPolicies, setExpiringPolicies] = useState<ExpiringPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, activityRes, policiesRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity?limit=5'),
        fetch('/api/dashboard/expiring-policies?limit=5&days=30'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.activities || []);
      }

      if (policiesRes.ok) {
        const policiesData = await policiesRes.json();
        setExpiringPolicies(policiesData.policies || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: t('dashboard.stats.clients'),
      value: stats?.totalClients ?? 0,
      description: t('dashboard.subtitle'),
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: t('dashboard.stats.policies'),
      value: stats?.activePolicies ?? 0,
      description: t('dashboard.subtitle'),
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: t('dashboard.stats.renewals'),
      value: stats?.pendingRenewals ?? 0,
      description: t('dashboard.expiringPolicies.description'),
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: t('documents.stats.pending'),
      value: stats?.pendingDocuments ?? 0,
      description: t('dashboard.subtitle'),
      icon: <Folder className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        {stats && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t('dashboard.stats.premium')}</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(stats.monthlyPremium)}
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp className="h-5 w-5" />
              {t('dashboard.activity.title')}
            </CardTitle>
            <CardDescription>{t('dashboard.activity.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('common.noResults')}
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50"
                  >
                    <div className="mt-0.5">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      {activity.user?.full_name && (
                        <p className="text-xs text-muted-foreground">
                          {activity.user.full_name}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Policies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Warning className="h-5 w-5 text-amber-500" />
                  {t('dashboard.expiringPolicies.title')}
                </CardTitle>
                <CardDescription>{t('dashboard.expiringPolicies.description')}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/policies?status=active')}
              >
                {t('dashboard.expiringPolicies.viewAll')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : expiringPolicies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('common.noResults')}
              </p>
            ) : (
              <div className="space-y-4">
                {expiringPolicies.map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/dashboard/policies/${policy.id}`)}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{getClientName(policy.client)}</p>
                      <p className="text-xs text-muted-foreground">
                        {getLobLabel(policy.line_of_business, t)} • {policy.policy_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(policy.premium)}</p>
                      <p className={`text-xs ${
                        (policy.daysUntilExpiration ?? 0) <= 7
                          ? 'text-red-600'
                          : 'text-amber-600'
                      }`}>
                        {t('dashboard.expiringPolicies.daysLeft', {
                          days: policy.daysUntilExpiration ?? 0
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
