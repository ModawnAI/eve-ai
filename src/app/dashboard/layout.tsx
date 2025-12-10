import { redirect } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const locale = await getLocale();
  const messages = await getMessages();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DashboardLayout
        user={{
          name: profile?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatar: profile?.avatar_url || undefined,
        }}
      >
        {children}
      </DashboardLayout>
    </NextIntlClientProvider>
  );
}
