'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MovingBorderProps {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  borderClassName?: string;
  containerClassName?: string;
  className?: string;
  as?: React.ElementType;
}

export function MovingBorder({
  children,
  duration = 2000,
  rx = '30%',
  ry = '30%',
  borderClassName,
  containerClassName,
  className,
  as: Component = 'button',
  ...props
}: MovingBorderProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component
      className={cn(
        'relative h-16 w-40 overflow-hidden bg-transparent p-[1px] text-xl',
        containerClassName
      )}
      style={{
        borderRadius: `calc(1.75rem * 0.96)`,
      }}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(1.75rem * 0.96)` }}
      >
        <MovingBorderSvg duration={duration} rx={rx} ry={ry}>
          <div
            className={cn(
              'h-20 w-20 bg-[radial-gradient(var(--primary)_40%,transparent_60%)] opacity-[0.8]',
              borderClassName
            )}
          />
        </MovingBorderSvg>
      </div>

      <div
        className={cn(
          'relative flex h-full w-full items-center justify-center border border-border bg-card text-sm text-foreground antialiased backdrop-blur-xl',
          className
        )}
        style={{
          borderRadius: `calc(1.75rem * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
}

interface MovingBorderSvgProps {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
}

function MovingBorderSvg({
  children,
  duration = 2000,
  rx = '30%',
  ry = '30%',
}: MovingBorderSvgProps) {
  const pathRef = React.useRef<SVGRectElement>(null);
  const progress = React.useRef(0);

  React.useEffect(() => {
    const pathLength = pathRef.current?.getTotalLength() || 0;
    let animationFrameId: number;

    const animate = () => {
      progress.current += pathLength / (duration / 16.67);
      if (progress.current > pathLength) {
        progress.current = 0;
      }

      if (pathRef.current) {
        const point = pathRef.current.getPointAtLength(progress.current);
        const transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`;
        const child = pathRef.current.parentElement?.querySelector(
          '.moving-border-child'
        ) as HTMLElement;
        if (child) {
          child.style.transform = transform;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [duration]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className="absolute h-full w-full"
      width="100%"
      height="100%"
    >
      <rect
        fill="none"
        width="100%"
        height="100%"
        rx={rx}
        ry={ry}
        ref={pathRef}
      />
      <foreignObject width="100%" height="100%">
        <div className="moving-border-child absolute">{children}</div>
      </foreignObject>
    </svg>
  );
}

interface GlowingButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlowingButton({ children, className, onClick }: GlowingButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,var(--primary)_0%,var(--background)_50%,var(--primary)_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background px-6 py-1 text-sm font-medium text-foreground backdrop-blur-3xl">
        {children}
      </span>
    </motion.button>
  );
}
