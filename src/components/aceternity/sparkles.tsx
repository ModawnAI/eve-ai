'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SparklesCoreProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  particleSpeed?: number;
}

export function SparklesCore({
  id = 'sparkles',
  className,
  background = 'transparent',
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 100,
  particleColor = '#FFF',
  particleSpeed = 0.5,
}: SparklesCoreProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = React.useState<
    Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeDirection: number;
    }>
  >([]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
        initParticles(width, height);
      }
    });

    resizeObserver.observe(canvas.parentElement!);

    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particleDensity]);

  const initParticles = (width: number, height: number) => {
    const newParticles = [];
    for (let i = 0; i < particleDensity; i++) {
      newParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: (Math.random() - 0.5) * particleSpeed,
        speedY: (Math.random() - 0.5) * particleSpeed,
        opacity: Math.random(),
        fadeDirection: Math.random() > 0.5 ? 1 : -1,
      });
    }
    setParticles(newParticles);
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Update opacity for twinkling effect
        particle.opacity += 0.01 * particle.fadeDirection;
        if (particle.opacity >= 1 || particle.opacity <= 0) {
          particle.fadeDirection *= -1;
        }

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        particles[index] = particle;
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [particles, particleColor]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      style={{ background }}
      className={cn('absolute inset-0 h-full w-full', className)}
    />
  );
}

interface SparklesProps {
  children?: React.ReactNode;
  className?: string;
  sparklesClassName?: string;
}

export function Sparkles({ children, className, sparklesClassName }: SparklesProps) {
  return (
    <div className={cn('relative', className)}>
      <SparklesCore
        className={sparklesClassName}
        particleColor="var(--primary)"
        particleDensity={50}
        minSize={0.6}
        maxSize={1.4}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
