'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        'mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: BentoGridItemProps) {
  return (
    <div
      className={cn(
        'group/bento row-span-1 flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-input transition duration-200 hover:shadow-xl h-full',
        className
      )}
    >
      <div className="flex-1 min-h-[10rem]">{header}</div>
      <div className="transition duration-200 group-hover/bento:translate-x-2 mt-4">
        {icon}
        <div className="mb-2 mt-2 font-sans font-bold text-foreground">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-muted-foreground">
          {description}
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  gradient?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
  gradient = 'from-primary/10 to-primary/5',
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg',
        className
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          gradient
        )}
      />
      <div className="relative z-10">
        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
