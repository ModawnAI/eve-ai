'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  User,
  Buildings,
  Bell,
  Shield,
  Palette,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tables } from '@/types/database';

type UserProfile = Tables<'users'>;
type Agency = Tables<'agencies'>;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function SettingsPage() {
  const t = useTranslations('settings');
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('light');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [, setAgencyData] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize theme from document class
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setThemeState('dark');
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  };

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    preferred_language: 'en' as 'en' | 'zh-CN',
  });

  // Agency form state
  const [agencyForm, setAgencyForm] = useState({
    name: '',
    license_number: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, agencyRes] = await Promise.all([
        fetch('/api/settings/profile'),
        fetch('/api/settings/agency'),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data.profile);
        setProfileForm({
          full_name: data.profile.full_name || '',
          phone: data.profile.phone || '',
          preferred_language: data.profile.preferred_language || 'en',
        });
      }

      if (agencyRes.ok) {
        const data = await agencyRes.json();
        setAgencyData(data.agency);
        setAgencyForm({
          name: data.agency.name || '',
          license_number: data.agency.license_number || '',
          phone: data.agency.phone || '',
          email: data.agency.email || '',
          address: data.agency.address || '',
          city: data.agency.city || '',
          state: data.agency.state || '',
          zip_code: data.agency.zip_code || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        toast.success(t('changesSaved'));
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAgency = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/agency', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agencyForm),
      });

      if (res.ok) {
        const data = await res.json();
        setAgencyData(data.agency);
        toast.success(t('changesSaved'));
      } else {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save agency settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            {t('tabs.profile')}
          </TabsTrigger>
          <TabsTrigger value="agency" className="gap-2">
            <Buildings className="h-4 w-4" />
            {t('tabs.agency')}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            {t('tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            {t('tabs.security')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            {t('tabs.appearance')}
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.title')}</CardTitle>
              <CardDescription>{t('profile.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                  <Separator />
                  <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="text-xl">
                        {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline">{t('profile.uploadPhoto')}</Button>
                      <p className="text-xs text-muted-foreground">
                        {t('profile.photoHint')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Form */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{t('profile.fullName')}</Label>
                      <Input
                        id="fullName"
                        value={profileForm.full_name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, full_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('profile.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('profile.phone')}</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">{t('profile.language')}</Label>
                      <Select
                        value={profileForm.preferred_language}
                        onValueChange={(value: 'en' | 'zh-CN') =>
                          setProfileForm({ ...profileForm, preferred_language: value })
                        }
                      >
                        <SelectTrigger id="language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="zh-CN">中文 (简体)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? 'Saving...' : t('saveChanges')}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agency Settings */}
        <TabsContent value="agency">
          <Card>
            <CardHeader>
              <CardTitle>{t('agency.title')}</CardTitle>
              <CardDescription>{t('agency.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="agencyName">{t('agency.name')}</Label>
                      <Input
                        id="agencyName"
                        value={agencyForm.name}
                        onChange={(e) =>
                          setAgencyForm({ ...agencyForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">{t('agency.license')}</Label>
                      <Input
                        id="licenseNumber"
                        value={agencyForm.license_number}
                        onChange={(e) =>
                          setAgencyForm({ ...agencyForm, license_number: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agencyPhone">{t('agency.phone')}</Label>
                      <Input
                        id="agencyPhone"
                        value={agencyForm.phone}
                        onChange={(e) =>
                          setAgencyForm({ ...agencyForm, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agencyEmail">{t('agency.email')}</Label>
                      <Input
                        id="agencyEmail"
                        value={agencyForm.email}
                        onChange={(e) =>
                          setAgencyForm({ ...agencyForm, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">{t('agency.address')}</Label>
                      <Input
                        id="address"
                        value={agencyForm.address}
                        onChange={(e) =>
                          setAgencyForm({ ...agencyForm, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('agency.city')}</Label>
                      <Input
                        id="city"
                        value={agencyForm.city}
                        onChange={(e) =>
                          setAgencyForm({ ...agencyForm, city: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">{t('agency.zipCode')}</Label>
                      <Input
                        id="zipCode"
                        value={agencyForm.zip_code}
                        onChange={(e) =>
                          setAgencyForm({ ...agencyForm, zip_code: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveAgency} disabled={saving}>
                      {saving ? 'Saving...' : t('saveChanges')}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications.title')}</CardTitle>
              <CardDescription>{t('notifications.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('notifications.policyRenewals')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('notifications.policyRenewalsDesc')}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('notifications.documentUploads')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('notifications.documentUploadsDesc')}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('notifications.aiProcessing')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('notifications.aiProcessingDesc')}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('notifications.marketing')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('notifications.marketingDesc')}
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t('security.title')}</CardTitle>
              <CardDescription>{t('security.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('security.changePassword')}</Label>
                  <div className="grid gap-2 md:grid-cols-3">
                    <Input type="password" placeholder={t('security.currentPassword')} />
                    <Input type="password" placeholder={t('security.newPassword')} />
                    <Input type="password" placeholder={t('security.confirmPassword')} />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('security.twoFactor')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('security.twoFactorDesc')}
                    </p>
                  </div>
                  <Button variant="outline">{t('security.enable')}</Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>{t('security.sessions')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('security.sessionsDesc')}
                  </p>
                  <Button variant="outline" className="text-destructive">
                    {t('security.logoutAll')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('appearance.title')}</CardTitle>
              <CardDescription>{t('appearance.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('appearance.theme')}</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('appearance.light')}</SelectItem>
                      <SelectItem value="dark">{t('appearance.dark')}</SelectItem>
                      <SelectItem value="system">{t('appearance.system')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('appearance.compactMode')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('appearance.compactModeDesc')}
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
