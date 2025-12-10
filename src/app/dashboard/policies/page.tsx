'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  Plus,
  MagnifyingGlass,
  DotsThree,
  Car,
  House,
  FirstAid,
  Briefcase,
  Heart,
  Question,
  SpinnerGap,
  Trash,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Tables, Enums } from '@/types/database';

type Policy = Tables<'policies'> & {
  client?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    client_type?: string;
  } | null;
  carrier?: {
    id: string;
    name: string;
  } | null;
};

type Client = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  type: 'individual' | 'business';
};

type Carrier = {
  id: string;
  name: string;
};

interface PoliciesResponse {
  policies: Policy[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const lineOfBusinessIcons: Record<string, React.ReactNode> = {
  personal_auto: <Car className="h-4 w-4" />,
  homeowners: <House className="h-4 w-4" />,
  health: <FirstAid className="h-4 w-4" />,
  commercial: <Briefcase className="h-4 w-4" />,
  life: <Heart className="h-4 w-4" />,
  other: <Question className="h-4 w-4" />,
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  pending: 'secondary',
  expired: 'destructive',
  cancelled: 'destructive',
  quote: 'outline',
  non_renewed: 'destructive',
};

export default function PoliciesPage() {
  const t = useTranslations('policies');
  const tCommon = useTranslations('common');

  const [policies, setPolicies] = React.useState<Policy[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [carriers, setCarriers] = React.useState<Carrier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [lobFilter, setLobFilter] = React.useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deletePolicy, setDeletePolicy] = React.useState<Policy | null>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    client_id: '',
    carrier_id: '',
    policy_number: '',
    line_of_business: 'personal_auto' as Enums<'line_of_business'>,
    status: 'quote' as Enums<'policy_status'>,
    effective_date: '',
    expiration_date: '',
    premium: '',
    notes: '',
  });

  // Fetch policies
  const fetchPolicies = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (lobFilter !== 'all') params.set('lob', lobFilter);
      params.set('limit', '50');

      const response = await fetch(`/api/policies?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch policies');
      }
      const data: PoliciesResponse = await response.json();
      setPolicies(data.policies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, lobFilter]);

  // Fetch clients for dropdown
  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients?limit=100');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  // Fetch carriers for dropdown
  const fetchCarriers = async () => {
    try {
      const response = await fetch('/api/carriers');
      if (response.ok) {
        const data = await response.json();
        setCarriers(data.carriers || []);
      }
    } catch (err) {
      console.error('Failed to fetch carriers:', err);
    }
  };

  React.useEffect(() => {
    fetchPolicies();
    fetchClients();
    fetchCarriers();
  }, [fetchPolicies]);

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchPolicies();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchPolicies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          premium: formData.premium ? parseFloat(formData.premium) : null,
          effective_date: formData.effective_date || null,
          expiration_date: formData.expiration_date || null,
          carrier_id: formData.carrier_id || null,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create policy');
      }

      setIsAddDialogOpen(false);
      setFormData({
        client_id: '',
        carrier_id: '',
        policy_number: '',
        line_of_business: 'personal_auto',
        status: 'quote',
        effective_date: '',
        expiration_date: '',
        premium: '',
        notes: '',
      });
      fetchPolicies();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePolicy) return;

    try {
      const response = await fetch(`/api/policies/${deletePolicy.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete policy');
      }

      setDeletePolicy(null);
      fetchPolicies();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete policy');
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getClientName = (policy: Policy) => {
    if (!policy.client) return '-';
    if (policy.client.business_name) return policy.client.business_name;
    return `${policy.client.first_name || ''} ${policy.client.last_name || ''}`.trim() || '-';
  };

  const getClientDisplayName = (client: Client) => {
    if (client.type === 'business' && client.business_name) {
      return client.business_name;
    }
    return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unnamed';
  };

  const getLobTranslationKey = (lob: string) => {
    const mapping: Record<string, string> = {
      personal_auto: 'personalAuto',
      homeowners: 'homeowners',
      commercial: 'commercial',
      health: 'health',
      life: 'life',
      other: 'other',
    };
    return mapping[lob] || lob;
  };

  if (loading && policies.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <SpinnerGap className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => fetchPolicies()}>Retry</Button>
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('addPolicy')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('addPolicy')}</DialogTitle>
              <DialogDescription>
                Enter the details for the new policy.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_id">{t('client')} *</Label>
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, client_id: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {getClientDisplayName(client)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carrier_id">{t('carrier')}</Label>
                    <Select
                      value={formData.carrier_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, carrier_id: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        {carriers.map((carrier) => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            {carrier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="policy_number">{t('policyNumber')} *</Label>
                    <Input
                      id="policy_number"
                      value={formData.policy_number}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, policy_number: e.target.value }))
                      }
                      placeholder="e.g., PA-2024-001234"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="line_of_business">{t('lineOfBusiness')} *</Label>
                    <Select
                      value={formData.line_of_business}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          line_of_business: value as Enums<'line_of_business'>,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal_auto">{t('personalAuto')}</SelectItem>
                        <SelectItem value="homeowners">{t('homeowners')}</SelectItem>
                        <SelectItem value="commercial">{t('commercial')}</SelectItem>
                        <SelectItem value="health">{t('health')}</SelectItem>
                        <SelectItem value="life">{t('life')}</SelectItem>
                        <SelectItem value="other">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">{t('status')}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: value as Enums<'policy_status'>,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quote">{t('quote')}</SelectItem>
                        <SelectItem value="pending">{t('pending')}</SelectItem>
                        <SelectItem value="active">{t('active')}</SelectItem>
                        <SelectItem value="expired">{t('expired')}</SelectItem>
                        <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                        <SelectItem value="non_renewed">{t('nonRenewed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="premium">{t('premium')}</Label>
                    <Input
                      id="premium"
                      type="number"
                      step="0.01"
                      value={formData.premium}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, premium: e.target.value }))
                      }
                      placeholder="e.g., 1500.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="effective_date">{t('effectiveDate')}</Label>
                    <Input
                      id="effective_date"
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, effective_date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiration_date">{t('expirationDate')}</Label>
                    <Input
                      id="expiration_date"
                      type="date"
                      value={formData.expiration_date}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, expiration_date: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  {tCommon('cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting || !formData.client_id || !formData.policy_number}>
                  {isSubmitting ? (
                    <>
                      <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    t('addPolicy')
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('filter.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filter.allStatus')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="pending">{t('pending')}</SelectItem>
                <SelectItem value="quote">{t('quote')}</SelectItem>
                <SelectItem value="expired">{t('expired')}</SelectItem>
                <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                <SelectItem value="non_renewed">{t('nonRenewed')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={lobFilter} onValueChange={setLobFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filter.lineOfBusiness')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filter.allLines')}</SelectItem>
                <SelectItem value="personal_auto">{t('personalAuto')}</SelectItem>
                <SelectItem value="homeowners">{t('homeowners')}</SelectItem>
                <SelectItem value="commercial">{t('commercial')}</SelectItem>
                <SelectItem value="health">{t('health')}</SelectItem>
                <SelectItem value="life">{t('life')}</SelectItem>
                <SelectItem value="other">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allPolicies')}</CardTitle>
          <CardDescription>
            {t('totalPolicies', { count: policies.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">{t('noPolicies')}</h3>
              <p className="text-muted-foreground mt-1">
                Get started by adding your first policy.
              </p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('addPolicy')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.policyNumber')}</TableHead>
                  <TableHead>{t('table.client')}</TableHead>
                  <TableHead>{t('table.type')}</TableHead>
                  <TableHead>{t('table.carrier')}</TableHead>
                  <TableHead>{t('table.dates')}</TableHead>
                  <TableHead>{t('table.premium')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id} className="cursor-pointer">
                    <TableCell className="font-mono text-sm">
                      {policy.policy_number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getClientName(policy)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {lineOfBusinessIcons[policy.line_of_business]}
                        <span className="text-sm">
                          {t(`lob.${getLobTranslationKey(policy.line_of_business)}`)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{policy.carrier?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{policy.effective_date || '-'}</p>
                        <p className="text-muted-foreground">
                          to {policy.expiration_date || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(policy.premium)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[policy.status] || 'default'}>
                        {t(policy.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <DotsThree className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>{t('actions.view')}</DropdownMenuItem>
                          <DropdownMenuItem>{t('actions.edit')}</DropdownMenuItem>
                          <DropdownMenuItem>{t('actions.renew')}</DropdownMenuItem>
                          <DropdownMenuItem>{t('actions.documents')}</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeletePolicy(policy)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            {t('actions.cancel')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePolicy} onOpenChange={() => setDeletePolicy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel policy {deletePolicy?.policy_number}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Policy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Policy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
