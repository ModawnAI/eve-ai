'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  ChartBar,
  CalendarBlank,
  CurrencyDollar,
  TrendUp,
  Warning,
  Download,
  FunnelSimple,
  MagnifyingGlass,
  CaretUp,
  CaretDown,
  Clock,
  Users,
  FileText,
  ArrowRight,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for reports
const overviewStats = {
  totalPolicies: 1247,
  policiesChange: 12.5,
  activeClients: 892,
  clientsChange: 8.3,
  monthlyCommissions: 45280,
  commissionsChange: 15.2,
  expiringThisMonth: 34,
  expiringChange: -5.1,
};

const expiringPolicies = [
  {
    id: '1',
    policyNumber: 'POL-2024-0892',
    clientName: 'John Smith',
    type: 'Health',
    carrier: 'Blue Shield',
    expirationDate: '2024-02-15',
    premium: 450,
    daysUntilExpiry: 7,
  },
  {
    id: '2',
    policyNumber: 'POL-2024-0756',
    clientName: 'Maria Garcia',
    type: 'Life',
    carrier: 'MetLife',
    expirationDate: '2024-02-18',
    premium: 125,
    daysUntilExpiry: 10,
  },
  {
    id: '3',
    policyNumber: 'POL-2024-0634',
    clientName: 'Robert Johnson',
    type: 'Medicare',
    carrier: 'Anthem',
    expirationDate: '2024-02-20',
    premium: 280,
    daysUntilExpiry: 12,
  },
  {
    id: '4',
    policyNumber: 'POL-2024-0521',
    clientName: 'Emily Chen',
    type: 'Health',
    carrier: 'Kaiser',
    expirationDate: '2024-02-25',
    premium: 520,
    daysUntilExpiry: 17,
  },
  {
    id: '5',
    policyNumber: 'POL-2024-0489',
    clientName: 'David Wilson',
    type: 'Dental',
    carrier: 'Delta Dental',
    expirationDate: '2024-02-28',
    premium: 85,
    daysUntilExpiry: 20,
  },
];

const commissionData = [
  {
    id: '1',
    policyNumber: 'POL-2024-0892',
    clientName: 'John Smith',
    carrier: 'Blue Shield',
    type: 'Health',
    premium: 450,
    commissionRate: 10,
    commission: 45,
    status: 'paid',
    paidDate: '2024-01-15',
  },
  {
    id: '2',
    policyNumber: 'POL-2024-0756',
    clientName: 'Maria Garcia',
    carrier: 'MetLife',
    type: 'Life',
    premium: 125,
    commissionRate: 50,
    commission: 62.5,
    status: 'pending',
    paidDate: null,
  },
  {
    id: '3',
    policyNumber: 'POL-2024-0634',
    clientName: 'Robert Johnson',
    carrier: 'Anthem',
    type: 'Medicare',
    premium: 280,
    commissionRate: 15,
    commission: 42,
    status: 'paid',
    paidDate: '2024-01-10',
  },
  {
    id: '4',
    policyNumber: 'POL-2024-0521',
    clientName: 'Emily Chen',
    carrier: 'Kaiser',
    type: 'Health',
    premium: 520,
    commissionRate: 8,
    commission: 41.6,
    status: 'processing',
    paidDate: null,
  },
  {
    id: '5',
    policyNumber: 'POL-2024-0489',
    clientName: 'David Wilson',
    carrier: 'Delta Dental',
    type: 'Dental',
    premium: 85,
    commissionRate: 20,
    commission: 17,
    status: 'paid',
    paidDate: '2024-01-20',
  },
];

const productionData = {
  newBusiness: {
    count: 45,
    premium: 52500,
    change: 18.5,
  },
  renewals: {
    count: 128,
    premium: 145200,
    change: 8.2,
  },
  lapsed: {
    count: 12,
    premium: 14800,
    change: -15.3,
  },
  retentionRate: 91.4,
};

export default function ReportsPage() {
  const t = useTranslations('reports');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [timeRange, setTimeRange] = React.useState('month');
  const [policyTypeFilter, setPolicyTypeFilter] = React.useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">{t('commissions.paid')}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{t('commissions.pending')}</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">{t('commissions.processing')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExpiryBadge = (days: number) => {
    if (days <= 7) {
      return <Badge className="bg-red-500">{days} {t('expirations.days')}</Badge>;
    } else if (days <= 14) {
      return <Badge className="bg-yellow-500">{days} {t('expirations.days')}</Badge>;
    } else {
      return <Badge variant="secondary">{days} {t('expirations.days')}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t('timeRange.week')}</SelectItem>
              <SelectItem value="month">{t('timeRange.month')}</SelectItem>
              <SelectItem value="quarter">{t('timeRange.quarter')}</SelectItem>
              <SelectItem value="year">{t('timeRange.year')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t('exportReport')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <ChartBar className="mr-2 h-4 w-4" />
            {t('tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="expirations">
            <CalendarBlank className="mr-2 h-4 w-4" />
            {t('tabs.expirations')}
          </TabsTrigger>
          <TabsTrigger value="commissions">
            <CurrencyDollar className="mr-2 h-4 w-4" />
            {t('tabs.commissions')}
          </TabsTrigger>
          <TabsTrigger value="production">
            <TrendUp className="mr-2 h-4 w-4" />
            {t('tabs.production')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('overview.totalPolicies')}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.totalPolicies}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {overviewStats.policiesChange > 0 ? (
                    <CaretUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <CaretDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={overviewStats.policiesChange > 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(overviewStats.policiesChange)}%
                  </span>
                  <span className="ml-1">{t('overview.fromLastMonth')}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('overview.activeClients')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.activeClients}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {overviewStats.clientsChange > 0 ? (
                    <CaretUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <CaretDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={overviewStats.clientsChange > 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(overviewStats.clientsChange)}%
                  </span>
                  <span className="ml-1">{t('overview.fromLastMonth')}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('overview.monthlyCommissions')}
                </CardTitle>
                <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overviewStats.monthlyCommissions)}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {overviewStats.commissionsChange > 0 ? (
                    <CaretUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <CaretDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={overviewStats.commissionsChange > 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(overviewStats.commissionsChange)}%
                  </span>
                  <span className="ml-1">{t('overview.fromLastMonth')}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('overview.expiringThisMonth')}
                </CardTitle>
                <Warning className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.expiringThisMonth}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {overviewStats.expiringChange < 0 ? (
                    <CaretDown className="h-4 w-4 text-green-500" />
                  ) : (
                    <CaretUp className="h-4 w-4 text-red-500" />
                  )}
                  <span className={overviewStats.expiringChange < 0 ? 'text-green-500' : 'text-red-500'}>
                    {Math.abs(overviewStats.expiringChange)}%
                  </span>
                  <span className="ml-1">{t('overview.fromLastMonth')}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('overview.upcomingExpirations')}</CardTitle>
                <CardDescription>{t('overview.upcomingExpirationsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expiringPolicies.slice(0, 3).map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{policy.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {policy.type} - {policy.carrier}
                        </p>
                      </div>
                      <div className="text-right">
                        {getExpiryBadge(policy.daysUntilExpiry)}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  {t('overview.viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('overview.recentCommissions')}</CardTitle>
                <CardDescription>{t('overview.recentCommissionsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissionData.slice(0, 3).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{commission.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {commission.carrier}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(commission.commission)}</p>
                        {getStatusBadge(commission.status)}
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4">
                  {t('overview.viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expirations Tab */}
        <TabsContent value="expirations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('expirations.title')}</CardTitle>
                  <CardDescription>{t('expirations.subtitle')}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('expirations.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-[200px]"
                    />
                  </div>
                  <Select value={policyTypeFilter} onValueChange={setPolicyTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <FunnelSimple className="mr-2 h-4 w-4" />
                      <SelectValue placeholder={t('expirations.filterByType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('expirations.allTypes')}</SelectItem>
                      <SelectItem value="health">{t('expirations.health')}</SelectItem>
                      <SelectItem value="life">{t('expirations.life')}</SelectItem>
                      <SelectItem value="medicare">{t('expirations.medicare')}</SelectItem>
                      <SelectItem value="dental">{t('expirations.dental')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('expirations.policyNumber')}</TableHead>
                    <TableHead>{t('expirations.client')}</TableHead>
                    <TableHead>{t('expirations.type')}</TableHead>
                    <TableHead>{t('expirations.carrier')}</TableHead>
                    <TableHead>{t('expirations.expirationDate')}</TableHead>
                    <TableHead>{t('expirations.premium')}</TableHead>
                    <TableHead>{t('expirations.status')}</TableHead>
                    <TableHead className="text-right">{t('expirations.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                      <TableCell>{policy.clientName}</TableCell>
                      <TableCell>{policy.type}</TableCell>
                      <TableCell>{policy.carrier}</TableCell>
                      <TableCell>{formatDate(policy.expirationDate)}</TableCell>
                      <TableCell>{formatCurrency(policy.premium)}</TableCell>
                      <TableCell>{getExpiryBadge(policy.daysUntilExpiry)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          {t('expirations.sendReminder')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-4">
          {/* Commission Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('commissions.totalEarned')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(208.1)}</div>
                <p className="text-xs text-muted-foreground">{t('commissions.thisMonth')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('commissions.pendingPayment')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(62.5)}</div>
                <p className="text-xs text-muted-foreground">1 {t('commissions.policies')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('commissions.avgRate')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">20.6%</div>
                <p className="text-xs text-muted-foreground">{t('commissions.acrossAllPolicies')}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('commissions.title')}</CardTitle>
                  <CardDescription>{t('commissions.subtitle')}</CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  {t('commissions.exportCSV')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('commissions.policyNumber')}</TableHead>
                    <TableHead>{t('commissions.client')}</TableHead>
                    <TableHead>{t('commissions.carrier')}</TableHead>
                    <TableHead>{t('commissions.premium')}</TableHead>
                    <TableHead>{t('commissions.rate')}</TableHead>
                    <TableHead>{t('commissions.commission')}</TableHead>
                    <TableHead>{t('commissions.status')}</TableHead>
                    <TableHead>{t('commissions.paidDate')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.policyNumber}</TableCell>
                      <TableCell>{item.clientName}</TableCell>
                      <TableCell>{item.carrier}</TableCell>
                      <TableCell>{formatCurrency(item.premium)}</TableCell>
                      <TableCell>{item.commissionRate}%</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.commission)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.paidDate ? formatDate(item.paidDate) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Production Tab */}
        <TabsContent value="production" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('production.newBusiness')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productionData.newBusiness.count}</div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(productionData.newBusiness.premium)} {t('production.inPremium')}
                </p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <CaretUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">{productionData.newBusiness.change}%</span>
                  <span className="ml-1">{t('production.vsLastPeriod')}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('production.renewals')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productionData.renewals.count}</div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(productionData.renewals.premium)} {t('production.inPremium')}
                </p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <CaretUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">{productionData.renewals.change}%</span>
                  <span className="ml-1">{t('production.vsLastPeriod')}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('production.lapsed')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productionData.lapsed.count}</div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(productionData.lapsed.premium)} {t('production.lostPremium')}
                </p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <CaretDown className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">{Math.abs(productionData.lapsed.change)}%</span>
                  <span className="ml-1">{t('production.vsLastPeriod')}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('production.retentionRate')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productionData.retentionRate}%</div>
                <p className="text-sm text-muted-foreground">{t('production.clientRetention')}</p>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${productionData.retentionRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Production Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('production.productionByType')}</CardTitle>
              <CardDescription>{t('production.productionByTypeDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'Health', count: 65, premium: 78000, percentage: 45 },
                  { type: 'Life', count: 32, premium: 48000, percentage: 25 },
                  { type: 'Medicare', count: 28, premium: 33600, percentage: 18 },
                  { type: 'Dental', count: 18, premium: 15300, percentage: 12 },
                ].map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.type}</span>
                        <span className="text-sm text-muted-foreground">
                          ({item.count} {t('production.policies')})
                        </span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.premium)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
