'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  UsersThree,
  Plus,
  MagnifyingGlass,
  Pencil,
  Trash,
  Shield,
  User,
  EnvelopeSimple,
  Phone,
  Calendar,
  DotsThreeVertical,
  Check,
  X,
  CircleNotch,
  UserCirclePlus,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'admin' | 'agent' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

// Mock data for team members
const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@agency.com',
    phone: '+1 (555) 123-4567',
    role: 'owner',
    status: 'active',
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2023-06-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@agency.com',
    phone: '+1 (555) 234-5678',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15T09:15:00Z',
    createdAt: '2023-08-15T00:00:00Z',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@agency.com',
    phone: '+1 (555) 345-6789',
    role: 'agent',
    status: 'active',
    lastLogin: '2024-01-14T16:45:00Z',
    createdAt: '2023-10-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@agency.com',
    role: 'agent',
    status: 'inactive',
    lastLogin: '2024-01-10T11:20:00Z',
    createdAt: '2023-11-15T00:00:00Z',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@agency.com',
    role: 'viewer',
    status: 'pending',
    createdAt: '2024-01-14T00:00:00Z',
  },
];

export default function UserManagementPage() {
  const t = useTranslations('admin');
  const [members, setMembers] = React.useState<TeamMember[]>(teamMembers);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<string>('agent');
  const [inviteName, setInviteName] = React.useState('');

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-purple-500">{t('roles.owner')}</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500">{t('roles.admin')}</Badge>;
      case 'agent':
        return <Badge variant="secondary">{t('roles.agent')}</Badge>;
      case 'viewer':
        return <Badge variant="outline">{t('roles.viewer')}</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            <Check className="mr-1 h-3 w-3" />
            {t('status.active')}
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-500">
            <X className="mr-1 h-3 w-3" />
            {t('status.inactive')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            <CircleNotch className="mr-1 h-3 w-3" />
            {t('status.pending')}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return t('users.neverLoggedIn');
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return t('users.justNow');
    if (diffHours < 24) return `${diffHours} ${t('users.hoursAgo')}`;
    if (diffHours < 48) return t('users.yesterday');
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteName) {
      toast.error(t('invite.fillRequired'));
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newMember: TeamMember = {
      id: `${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole as TeamMember['role'],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setMembers([...members, newMember]);
    setIsInviteDialogOpen(false);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('agent');
    setLoading(false);
    toast.success(t('invite.success'));
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMembers(
      members.map((m) =>
        m.id === memberId ? { ...m, role: newRole as TeamMember['role'] } : m
      )
    );
    setLoading(false);
    toast.success(t('users.roleUpdated'));
  };

  const handleToggleStatus = async (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    setMembers(
      members.map((m) =>
        m.id === memberId ? { ...m, status: newStatus } : m
      )
    );
    setLoading(false);
    toast.success(
      newStatus === 'active' ? t('users.activated') : t('users.deactivated')
    );
  };

  const handleRemoveMember = async (memberId: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMembers(members.filter((m) => m.id !== memberId));
    setLoading(false);
    toast.success(t('users.removed'));
  };

  const roleStats = {
    total: members.length,
    owners: members.filter((m) => m.role === 'owner').length,
    admins: members.filter((m) => m.role === 'admin').length,
    agents: members.filter((m) => m.role === 'agent').length,
    viewers: members.filter((m) => m.role === 'viewer').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserCirclePlus className="mr-2 h-4 w-4" />
              {t('invite.button')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('invite.title')}</DialogTitle>
              <DialogDescription>{t('invite.description')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('invite.name')}</Label>
                <Input
                  id="name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder={t('invite.namePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('invite.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('invite.emailPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t('invite.role')}</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                    <SelectItem value="agent">{t('roles.agent')}</SelectItem>
                    <SelectItem value="viewer">{t('roles.viewer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                {t('invite.cancel')}
              </Button>
              <Button onClick={handleInvite} disabled={loading}>
                {loading ? (
                  <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <EnvelopeSimple className="mr-2 h-4 w-4" />
                )}
                {t('invite.send')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.totalUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('roles.owner')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.owners}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('roles.admin')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('roles.agent')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.agents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('roles.viewer')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.viewers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('users.title')}</CardTitle>
              <CardDescription>{t('users.subtitle')}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('users.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <Shield className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t('users.filterByRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('users.allRoles')}</SelectItem>
                  <SelectItem value="owner">{t('roles.owner')}</SelectItem>
                  <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                  <SelectItem value="agent">{t('roles.agent')}</SelectItem>
                  <SelectItem value="viewer">{t('roles.viewer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('users.user')}</TableHead>
                <TableHead>{t('users.role')}</TableHead>
                <TableHead>{t('users.status')}</TableHead>
                <TableHead>{t('users.lastLogin')}</TableHead>
                <TableHead>{t('users.joinedDate')}</TableHead>
                <TableHead className="text-right">{t('users.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {member.avatar ? (
                          <AvatarImage src={member.avatar} alt={member.name} />
                        ) : null}
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatLastLogin(member.lastLogin)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <DotsThreeVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{t('users.manageUser')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMember(member);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('users.editRole')}
                        </DropdownMenuItem>
                        {member.role !== 'owner' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(member.id)}
                            >
                              {member.status === 'active' ? (
                                <>
                                  <X className="mr-2 h-4 w-4" />
                                  {t('users.deactivate')}
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  {t('users.activate')}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              {t('users.remove')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permissions Guide */}
      <Card>
        <CardHeader>
          <CardTitle>{t('permissions.title')}</CardTitle>
          <CardDescription>{t('permissions.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500">{t('roles.owner')}</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- {t('permissions.fullAccess')}</li>
                <li>- {t('permissions.manageUsers')}</li>
                <li>- {t('permissions.billing')}</li>
                <li>- {t('permissions.deleteAgency')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500">{t('roles.admin')}</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- {t('permissions.manageClients')}</li>
                <li>- {t('permissions.managePolicies')}</li>
                <li>- {t('permissions.manageUsers')}</li>
                <li>- {t('permissions.viewReports')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{t('roles.agent')}</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- {t('permissions.manageClients')}</li>
                <li>- {t('permissions.managePolicies')}</li>
                <li>- {t('permissions.uploadDocuments')}</li>
                <li>- {t('permissions.useAI')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t('roles.viewer')}</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- {t('permissions.viewClients')}</li>
                <li>- {t('permissions.viewPolicies')}</li>
                <li>- {t('permissions.viewDocuments')}</li>
                <li>- {t('permissions.readOnly')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('users.editRole')}</DialogTitle>
            <DialogDescription>
              {t('users.editRoleDescription')} {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getInitials(selectedMember.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedMember.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>{t('users.selectRole')}</Label>
                <Select
                  value={selectedMember.role}
                  onValueChange={(value) => {
                    handleUpdateRole(selectedMember.id, value);
                    setIsEditDialogOpen(false);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                    <SelectItem value="agent">{t('roles.agent')}</SelectItem>
                    <SelectItem value="viewer">{t('roles.viewer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('invite.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
