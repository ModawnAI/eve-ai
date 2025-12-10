'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform, useMotionValue, useSpring, animate } from 'framer-motion';
import {
  FileText,
  Users,
  Globe,
  ShieldCheck,
  Plugs,
  ChartLine,
  ArrowRight,
  Check,
  CaretDown,
  Sparkle,
  Lightning,
  Robot,
  Upload,
  CheckCircle,
  Clock,
  TrendUp,
  Bell,
  MagnifyingGlass,
  Translate,
  FileDoc,
  House,
  Car,
  Heart,
  Umbrella,
  List,
  X,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Spotlight,
  BentoGrid,
  BentoGridItem,
  InfiniteMovingCards,
  HoverBorderGradient,
  GlowingButton,
} from '@/components/aceternity';

// Animated counter component
function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const count = useMotionValue(0);
  const rounded = useSpring(count, { duration: duration * 1000 });
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [rounded]);

  React.useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [count, value, duration]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// Mini chart component for stats
function MiniChart({ data, color = 'primary' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const colorClass = color === 'primary' ? 'bg-primary' : color === 'chart-1' ? 'bg-chart-1' : color === 'chart-2' ? 'bg-chart-2' : 'bg-chart-5';

  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((value, index) => (
        <motion.div
          key={index}
          initial={{ height: 0 }}
          animate={{ height: `${(value / max) * 100}%` }}
          transition={{ delay: index * 0.05, duration: 0.5 }}
          className={`w-1 ${colorClass} rounded-full opacity-70`}
        />
      ))}
    </div>
  );
}

// Language switcher component
function LanguageSwitcher() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentLocale, setCurrentLocale] = React.useState('en');

  React.useEffect(() => {
    const locale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] || 'en';
    setCurrentLocale(locale);
  }, []);

  const switchLanguage = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
    setCurrentLocale(locale);
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all"
      >
        <Globe className="h-4 w-4" />
        {currentLocale === 'en' ? 'EN' : '中文'}
        <CaretDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden"
        >
          <button
            onClick={() => switchLanguage('en')}
            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 ${
              currentLocale === 'en' ? 'text-primary font-medium bg-accent/50' : 'text-foreground'
            }`}
          >
            {currentLocale === 'en' && <Check className="h-3.5 w-3.5" />}
            English
          </button>
          <button
            onClick={() => switchLanguage('zh-CN')}
            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 ${
              currentLocale === 'zh-CN' ? 'text-primary font-medium bg-accent/50' : 'text-foreground'
            }`}
          >
            {currentLocale === 'zh-CN' && <Check className="h-3.5 w-3.5" />}
            中文
          </button>
        </motion.div>
      )}
    </div>
  );
}

// Navigation component
function Navigation() {
  const t = useTranslations('landing.nav');
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on a link
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navItems = ['features', 'howItWorks', 'testimonials'];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg shadow-md group-hover:shadow-lg transition-shadow">
                  E
                </div>
                <span className="font-semibold text-xl tracking-tight">EVE AI</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <a
                    key={item}
                    href={`#${item === 'howItWorks' ? 'how-it-works' : item}`}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent/50"
                  >
                    {t(item)}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="rounded-full px-4">
                  {t('login')}
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm" className="rounded-full px-5 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
                  {t('getStarted')}
                </Button>
              </Link>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-accent/50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" weight="bold" />
                ) : (
                  <List className="h-6 w-6" weight="bold" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 md:hidden"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-16 bottom-0 w-full max-w-sm bg-card border-l border-border shadow-xl"
          >
            <div className="flex flex-col h-full">
              {/* Nav links */}
              <div className="flex-1 px-6 py-6 space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item}
                    href={`#${item === 'howItWorks' ? 'how-it-works' : item}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-colors"
                  >
                    {t(item)}
                  </a>
                ))}
              </div>

              {/* Bottom section with auth buttons */}
              <div className="px-6 py-6 border-t border-border space-y-4">
                <div className="flex justify-center">
                  <LanguageSwitcher />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-xl bg-primary hover:bg-primary/90">
                      {t('getStarted')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

// Live stats ticker
function LiveStatsTicker() {
  const stats = [
    { label: 'Documents Processed', value: 12847, icon: FileDoc },
    { label: 'Active Agencies', value: 2340, icon: House },
    { label: 'Policies Managed', value: 847293, icon: ShieldCheck },
    { label: 'AI Accuracy', value: 99.2, suffix: '%', icon: Robot },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 justify-center">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.1 }}
          className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/30"
        >
          <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" weight="duotone" />
          <div className="text-left min-w-0">
            <div className="text-sm md:text-lg font-bold">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2.5} />
            </div>
            <div className="text-[10px] md:text-xs text-muted-foreground truncate">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Interactive dashboard preview
function DashboardPreview() {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [notifications, setNotifications] = React.useState(3);

  // Simulated live data
  const [activePolicies, setActivePolicies] = React.useState(2847);
  const [pendingClaims, setPendingClaims] = React.useState(156);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActivePolicies(prev => prev + Math.floor(Math.random() * 3));
      if (Math.random() > 0.7) {
        setPendingClaims(prev => Math.max(150, prev + (Math.random() > 0.5 ? 1 : -1)));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const chartData = [35, 45, 30, 50, 40, 60, 55, 70, 65, 80, 75, 90];
  const recentActivity = [
    { icon: FileDoc, text: 'Policy #INS-2847 renewed', time: '2m ago', color: 'text-chart-1' },
    { icon: Users, text: 'New client: Johnson Family', time: '5m ago', color: 'text-chart-2' },
    { icon: Robot, text: 'AI processed 12 documents', time: '8m ago', color: 'text-primary' },
    { icon: Bell, text: '3 renewals due this week', time: '15m ago', color: 'text-chart-5' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="mt-8 md:mt-16 relative hidden sm:block"
    >
      <div className="relative mx-auto max-w-5xl px-4 md:px-0">
        {/* Glow effect behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-chart-2/20 to-primary/20 blur-3xl scale-110 opacity-50" />

        {/* Main preview card */}
        <div className="relative rounded-xl md:rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Window header */}
          <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex gap-1 md:gap-1.5">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-400/80" />
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-400/80" />
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/50 text-xs">
                <MagnifyingGlass className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Search clients, policies...</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                className="relative p-1.5 md:p-2 rounded-lg hover:bg-muted/50 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Bell className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {notifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-red-500 text-[8px] md:text-[10px] text-white flex items-center justify-center font-medium">
                    {notifications}
                  </span>
                )}
              </motion.button>
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-[10px] md:text-xs font-medium text-white">
                JD
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-3 md:p-5 flex gap-3 md:gap-5">
            {/* Sidebar - hidden on mobile */}
            <div className="hidden lg:block w-48 space-y-2 shrink-0">
              {[
                { icon: House, label: 'Dashboard', active: activeTab === 'overview' },
                { icon: Users, label: 'Clients', active: activeTab === 'clients' },
                { icon: ShieldCheck, label: 'Policies', active: activeTab === 'policies' },
                { icon: FileDoc, label: 'Documents', active: activeTab === 'documents' },
                { icon: Robot, label: 'AI Assistant', active: activeTab === 'ai', highlight: true },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => setActiveTab(item.label.toLowerCase())}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    item.active
                      ? 'bg-primary/10 text-primary font-medium'
                      : item.highlight
                        ? 'text-primary hover:bg-primary/5'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" weight={item.active ? 'fill' : 'regular'} />
                  {item.label}
                  {item.highlight && (
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-medium">
                      NEW
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 space-y-3 md:space-y-4 min-w-0">
              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                <motion.div
                  className="p-3 md:p-4 rounded-lg md:rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <span className="text-[10px] md:text-xs text-muted-foreground">Active Policies</span>
                    <TrendUp className="h-3 w-3 md:h-4 md:w-4 text-chart-1" />
                  </div>
                  <div className="text-lg md:text-2xl font-bold text-primary">
                    <AnimatedCounter value={activePolicies} duration={1} />
                  </div>
                  <div className="text-[10px] md:text-xs text-chart-1 mt-0.5 md:mt-1">+12.5% this month</div>
                </motion.div>

                <motion.div
                  className="p-3 md:p-4 rounded-lg md:rounded-xl bg-muted/30 border border-border/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <span className="text-[10px] md:text-xs text-muted-foreground">Pending Claims</span>
                    <Clock className="h-3 w-3 md:h-4 md:w-4 text-chart-5" />
                  </div>
                  <div className="text-lg md:text-2xl font-bold">{pendingClaims}</div>
                  <div className="text-[10px] md:text-xs text-chart-5 mt-0.5 md:mt-1">4 need review</div>
                </motion.div>

                <motion.div
                  className="p-3 md:p-4 rounded-lg md:rounded-xl bg-muted/30 border border-border/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <span className="text-[10px] md:text-xs text-muted-foreground">Monthly Revenue</span>
                    <ChartLine className="h-3 w-3 md:h-4 md:w-4 text-chart-2" />
                  </div>
                  <div className="text-lg md:text-2xl font-bold">$1.24M</div>
                  <div className="text-[10px] md:text-xs text-chart-1 mt-0.5 md:mt-1">+8.3% vs last month</div>
                </motion.div>

                <motion.div
                  className="p-3 md:p-4 rounded-lg md:rounded-xl bg-muted/30 border border-border/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <span className="text-[10px] md:text-xs text-muted-foreground">AI Processed</span>
                    <Robot className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                  </div>
                  <div className="text-lg md:text-2xl font-bold">847</div>
                  <div className="text-[10px] md:text-xs text-primary mt-0.5 md:mt-1">99.2% accuracy</div>
                </motion.div>
              </div>

              {/* Chart and Activity row */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-3">
                {/* Chart */}
                <div className="md:col-span-3 p-3 md:p-4 rounded-lg md:rounded-xl bg-muted/20 border border-border/30">
                  <div className="flex items-center justify-between mb-2 md:mb-4">
                    <span className="text-xs md:text-sm font-medium">Premium Growth</span>
                    <div className="flex gap-1">
                      {['1M', '3M', '1Y'].map((period) => (
                        <button
                          key={period}
                          className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs ${
                            period === '1Y' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-16 md:h-24 flex items-end gap-1 md:gap-2">
                    {chartData.map((value, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${value}%` }}
                        transition={{ delay: 0.8 + index * 0.05, duration: 0.5 }}
                        className="flex-1 bg-gradient-to-t from-primary/80 to-primary/40 rounded-t"
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5 md:mt-2 text-[8px] md:text-[10px] text-muted-foreground">
                    <span>Jan</span>
                    <span>Mar</span>
                    <span>Jun</span>
                    <span>Sep</span>
                    <span>Dec</span>
                  </div>
                </div>

                {/* Recent Activity - hidden on small screens */}
                <div className="hidden md:block md:col-span-2 p-3 md:p-4 rounded-lg md:rounded-xl bg-muted/20 border border-border/30">
                  <span className="text-xs md:text-sm font-medium">Recent Activity</span>
                  <div className="mt-2 md:mt-3 space-y-2 md:space-y-2.5">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="flex items-center gap-2 text-[10px] md:text-xs"
                      >
                        <activity.icon className={`h-3 w-3 md:h-3.5 md:w-3.5 ${activity.color} shrink-0`} weight="fill" />
                        <span className="flex-1 truncate">{activity.text}</span>
                        <span className="text-muted-foreground shrink-0">{activity.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Hero Section
function HeroSection() {
  const t = useTranslations('landing.hero');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Trust logos - real company-style names
  const trustLogos = [
    'Pacific Insurance Group',
    'Chen & Associates',
    'Golden State Agency',
    'Bay Area Insurers',
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
    >
      {/* Spotlight effects */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="var(--primary)" />
      <Spotlight className="top-10 right-0 md:right-60" fill="var(--chart-2)" />

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-chart-2/15 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto max-w-6xl px-6 lg:px-8 text-center pt-24"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm px-4 py-2 text-sm text-primary font-medium">
            <Sparkle className="h-4 w-4" weight="fill" />
            {t('badge')}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-4 md:mb-6 px-2"
        >
          <span className="block">{t('title')}</span>
          <span className="block mt-1 md:mt-2 bg-gradient-to-r from-primary via-primary to-chart-2 bg-clip-text text-transparent">
            {t('titleHighlight')}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 md:mb-10 px-4"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center mb-12"
        >
          <Link href="/register">
            <HoverBorderGradient
              containerClassName="rounded-full"
              className="flex items-center gap-2 px-8 py-3.5 font-medium text-base"
            >
              <Lightning className="h-5 w-5" weight="fill" />
              {t('cta')}
            </HoverBorderGradient>
          </Link>
        </motion.div>

        {/* Trust indicators with real logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col items-center gap-3 md:gap-4"
        >
          <p className="text-xs md:text-sm text-muted-foreground">
            {t('trustedBy')}
          </p>
          <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-4 lg:gap-6 justify-center">
            {trustLogos.map((logo, index) => (
              <motion.div
                key={logo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ opacity: 1 }}
                className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg border border-border/30 bg-muted/20"
              >
                <ShieldCheck className="h-3 w-3 md:h-4 md:w-4 text-primary shrink-0" weight="fill" />
                <span className="text-[11px] md:text-sm font-medium truncate">{logo}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Dashboard Preview */}
        <DashboardPreview />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-muted-foreground/60"
        >
          <span className="text-xs font-medium uppercase tracking-wider">Scroll</span>
          <CaretDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Feature card visual components
function AIDocumentVisual() {
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState<'uploading' | 'processing' | 'done'>('uploading');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setStatus('done');
          return 100;
        }
        if (prev >= 60) setStatus('processing');
        return prev + 2;
      });
    }, 100);

    const reset = setInterval(() => {
      setProgress(0);
      setStatus('uploading');
    }, 8000);

    return () => {
      clearInterval(timer);
      clearInterval(reset);
    };
  }, []);

  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 flex flex-col justify-center">
      <div className="space-y-3">
        {/* File being processed */}
        <motion.div
          className="flex items-center gap-3 p-3 rounded-lg bg-card/80 border border-border/50"
          animate={{ scale: status === 'processing' ? [1, 1.02, 1] : 1 }}
          transition={{ repeat: status === 'processing' ? Infinity : 0, duration: 1 }}
        >
          <FileDoc className="h-8 w-8 text-primary" weight="duotone" />
          <div className="flex-1">
            <div className="text-sm font-medium">policy_dec_page.pdf</div>
            <div className="h-2 rounded-full bg-muted mt-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {status === 'done' ? (
            <CheckCircle className="h-5 w-5 text-chart-1" weight="fill" />
          ) : (
            <span className="text-xs text-muted-foreground">{progress}%</span>
          )}
        </motion.div>

        {/* Extracted data preview */}
        <motion.div
          className="space-y-2 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 60 ? 1 : 0 }}
        >
          <div className="flex justify-between p-2 rounded bg-chart-1/10 text-chart-1">
            <span>Policy #:</span>
            <span className="font-mono">INS-2024-847293</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-primary/10">
            <span>Coverage:</span>
            <span className="font-medium">$500,000</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-chart-2/10">
            <span>Expiry:</span>
            <span className="font-medium">Dec 31, 2025</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ClientManagementVisual() {
  const clients = [
    { name: 'Johnson Family', policies: 3, status: 'Active' },
    { name: 'ABC Corp', policies: 5, status: 'Renewal' },
    { name: 'Chen Holdings', policies: 2, status: 'Active' },
  ];

  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-chart-2/10 via-chart-2/5 to-transparent p-4">
      <div className="space-y-2">
        {clients.map((client, index) => (
          <motion.div
            key={client.name}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-2 rounded-lg bg-card/60 border border-border/30"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chart-2 to-primary flex items-center justify-center text-xs font-bold text-white">
              {client.name[0]}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{client.name}</div>
              <div className="text-xs text-muted-foreground">{client.policies} policies</div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              client.status === 'Active' ? 'bg-chart-1/20 text-chart-1' : 'bg-chart-5/20 text-chart-5'
            }`}>
              {client.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BilingualVisual() {
  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-chart-2/10 via-chart-2/5 to-transparent p-4 flex items-center justify-center">
      <div className="flex items-center gap-4">
        <motion.div
          className="p-3 rounded-xl bg-card/80 border border-border/50"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0 }}
        >
          <div className="text-sm font-medium">Hello!</div>
          <div className="text-xs text-muted-foreground">Welcome</div>
        </motion.div>
        <Translate className="h-6 w-6 text-chart-2" weight="duotone" />
        <motion.div
          className="p-3 rounded-xl bg-card/80 border border-border/50"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
        >
          <div className="text-sm font-medium">你好!</div>
          <div className="text-xs text-muted-foreground">欢迎</div>
        </motion.div>
      </div>
    </div>
  );
}

function PolicyTrackingVisual() {
  const policies = [
    { type: 'Auto', icon: Car, days: 15, colorClass: 'text-chart-5' },
    { type: 'Home', icon: House, days: 45, colorClass: 'text-chart-1' },
    { type: 'Health', icon: Heart, days: 8, colorClass: 'text-primary' },
    { type: 'Life', icon: Umbrella, days: 120, colorClass: 'text-chart-2' },
  ];

  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-chart-2/10 via-chart-2/5 to-transparent p-4">
      <div className="grid grid-cols-2 gap-2 h-full">
        {policies.map((policy, index) => (
          <motion.div
            key={policy.type}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="p-3 rounded-lg bg-card/60 border border-border/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <policy.icon className={`h-4 w-4 ${policy.colorClass}`} weight="duotone" />
              <span className="text-xs font-medium">{policy.type}</span>
            </div>
            <div className={`text-lg font-bold ${
              policy.days < 15 ? 'text-primary' : policy.days < 30 ? 'text-chart-5' : 'text-chart-1'
            }`}>
              {policy.days}d
            </div>
            <div className="text-[10px] text-muted-foreground">until renewal</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsVisual() {
  const integrations = ['IVANS', 'HealthSherpa', 'CoveredCA', 'Medicare'];

  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-chart-5/10 via-chart-5/5 to-transparent p-4 flex items-center justify-center">
      <div className="relative">
        <motion.div
          className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Plugs className="h-7 w-7 text-primary" weight="duotone" />
        </motion.div>
        {integrations.map((name, index) => {
          const angle = (index * 90) * (Math.PI / 180);
          const radius = 50;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <motion.div
              key={name}
              className="absolute w-16 text-center"
              style={{ left: `calc(50% + ${x}px - 32px)`, top: `calc(50% + ${y}px - 10px)` }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <span className="text-[10px] font-medium bg-card/80 px-2 py-1 rounded border border-border/50">
                {name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ReportsVisual() {
  const data = [30, 45, 35, 60, 50, 75, 65, 85, 70, 95, 80, 100];

  return (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-chart-1/10 via-chart-1/5 to-transparent p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium">Revenue Trend</span>
        <span className="text-xs text-chart-1 font-medium">+24.5%</span>
      </div>
      <div className="flex-1 flex items-end gap-1">
        {data.map((value, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            whileInView={{ height: `${value}%` }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="flex-1 bg-gradient-to-t from-chart-1/80 to-chart-1/40 rounded-t"
          />
        ))}
      </div>
    </div>
  );
}

// Features Section
function FeaturesSection() {
  const t = useTranslations('landing.features');

  const features = [
    {
      icon: <Robot className="h-5 w-5 md:h-6 md:w-6" weight="duotone" />,
      title: t('aiDocuments.title'),
      description: t('aiDocuments.description'),
      visual: <AIDocumentVisual />,
    },
    {
      icon: <Users className="h-5 w-5 md:h-6 md:w-6" weight="duotone" />,
      title: t('clientManagement.title'),
      description: t('clientManagement.description'),
      visual: <ClientManagementVisual />,
    },
    {
      icon: <Globe className="h-5 w-5 md:h-6 md:w-6" weight="duotone" />,
      title: t('bilingual.title'),
      description: t('bilingual.description'),
      visual: <BilingualVisual />,
    },
    {
      icon: <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" weight="duotone" />,
      title: t('policyTracking.title'),
      description: t('policyTracking.description'),
      visual: <PolicyTrackingVisual />,
    },
    {
      icon: <Plugs className="h-5 w-5 md:h-6 md:w-6" weight="duotone" />,
      title: t('integrations.title'),
      description: t('integrations.description'),
      visual: <IntegrationsVisual />,
    },
    {
      icon: <ChartLine className="h-5 w-5 md:h-6 md:w-6" weight="duotone" />,
      title: t('reports.title'),
      description: t('reports.description'),
      visual: <ReportsVisual />,
    },
  ];

  return (
    <section id="features" className="py-16 md:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-muted/30 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-20"
        >
          <span className="inline-block px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium mb-3 md:mb-4">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 md:mb-6">
            {t('title')}
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t('subtitle')}
          </p>
        </motion.div>

        <BentoGrid className="md:grid-cols-2 lg:grid-cols-3 md:auto-rows-[24rem]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <BentoGridItem
                title={feature.title}
                description={feature.description}
                icon={
                  <div className="rounded-lg md:rounded-xl bg-primary/10 p-2 md:p-2.5 text-primary w-fit">
                    {feature.icon}
                  </div>
                }
                header={feature.visual}
              />
            </motion.div>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const t = useTranslations('landing.howItWorks');

  const steps = [
    {
      number: '01',
      title: t('step1.title'),
      description: t('step1.description'),
      icon: <FileText className="h-6 w-6 md:h-8 md:w-8" weight="duotone" />,
      visual: (
        <div className="mt-3 md:mt-4 p-2.5 md:p-3 rounded-lg bg-muted/50 border border-dashed border-border">
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
            <Upload className="h-4 w-4 md:h-5 md:w-5" />
            <span>Drop files here or click to upload</span>
          </div>
        </div>
      ),
    },
    {
      number: '02',
      title: t('step2.title'),
      description: t('step2.description'),
      icon: <Robot className="h-6 w-6 md:h-8 md:w-8" weight="duotone" />,
      visual: (
        <div className="mt-3 md:mt-4 flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-primary border-t-transparent"
          />
          <span className="text-xs md:text-sm text-primary">Processing with 99.2% accuracy...</span>
        </div>
      ),
    },
    {
      number: '03',
      title: t('step3.title'),
      description: t('step3.description'),
      icon: <ChartLine className="h-6 w-6 md:h-8 md:w-8" weight="duotone" />,
      visual: (
        <div className="mt-3 md:mt-4">
          <MiniChart data={[20, 35, 30, 45, 40, 55, 50, 65, 60, 75, 70, 85]} color="green" />
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hidden md:block absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent opacity-50" />
        <div className="hidden md:block absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent opacity-50" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-20"
        >
          <span className="inline-block px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-chart-2/10 text-chart-2 text-xs md:text-sm font-medium mb-3 md:mb-4">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 md:mb-6">
            {t('title')}
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-full h-px">
                  <div className="w-full h-full bg-gradient-to-r from-primary/30 to-transparent" />
                </div>
              )}

              <div className="relative p-5 md:p-8 rounded-xl md:rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all duration-300 group-hover:shadow-xl">
                {/* Number badge */}
                <div className="absolute -top-3 md:-top-4 left-5 md:left-8">
                  <span className="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-bold">
                    {index + 1}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>

                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{step.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.description}</p>

                {/* Interactive visual */}
                {step.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const t = useTranslations('landing.testimonials');

  const testimonials = [
    { quote: t('items.0.quote'), name: t('items.0.name'), title: t('items.0.title') },
    { quote: t('items.1.quote'), name: t('items.1.name'), title: t('items.1.title') },
    { quote: t('items.2.quote'), name: t('items.2.name'), title: t('items.2.title') },
    { quote: t('items.3.quote'), name: t('items.3.name'), title: t('items.3.title') },
    { quote: t('items.4.quote'), name: t('items.4.name'), title: t('items.4.title') },
  ];

  return (
    <section id="testimonials" className="py-16 md:py-32 relative bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="inline-block px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-green-500/10 text-green-600 text-xs md:text-sm font-medium mb-3 md:mb-4">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 md:mb-6">
            {t('title')}
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            {t('subtitle')}
          </p>
        </motion.div>

        <InfiniteMovingCards items={testimonials} direction="left" speed="slow" />
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  const t = useTranslations('landing.cta');

  return (
    <section className="py-16 md:py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-2/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] rounded-full bg-gradient-radial from-primary/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 md:p-12 rounded-2xl md:rounded-3xl border border-border/50 bg-card/50 backdrop-blur-xl"
        >
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-10">
            {[
              { value: 2340, suffix: '+', label: 'Active Agencies' },
              { value: 99.2, suffix: '%', label: 'AI Accuracy' },
              { value: 80, suffix: '%', label: 'Time Saved' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-xl md:text-3xl font-bold text-primary">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2} />
                </div>
                <div className="text-[10px] md:text-sm text-muted-foreground mt-0.5 md:mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 md:mb-6">
            {t('title')}
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground mb-6 md:mb-10 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          <Link href="/register">
            <GlowingButton className="text-sm md:text-base px-6 md:px-8">
              {t('button')}
              <ArrowRight className="ml-2 h-3.5 w-3.5 md:h-4 md:w-4" />
            </GlowingButton>
          </Link>

          <p className="mt-4 md:mt-6 text-xs md:text-sm text-muted-foreground flex items-center justify-center gap-1.5 md:gap-2">
            <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500" />
            {t('noCard')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1 mb-4 md:mb-0">
            <Link href="/" className="flex items-center gap-2 md:gap-2.5 mb-3 md:mb-4">
              <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg md:rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-base md:text-lg">
                E
              </div>
              <span className="font-semibold text-lg md:text-xl tracking-tight">EVE AI</span>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {t('description')}
            </p>
          </div>

          {[
            { title: 'product', links: ['features', 'pricing', 'integrations'] },
            { title: 'company', links: ['about', 'contact', 'careers'] },
            { title: 'legal', links: ['privacy', 'terms'] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">{t(section.title)}</h4>
              <ul className="space-y-2 md:space-y-3 text-xs md:text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href={link === 'features' ? '#features' : '#'}
                      className="hover:text-foreground transition-colors"
                    >
                      {t(link)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-4 md:gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background font-sans antialiased">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
