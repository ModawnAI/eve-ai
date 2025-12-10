'use client';

import * as React from 'react';
import { motion, stagger, useAnimate, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}

export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.5,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, { once: true });
  const wordsArray = words.split(' ');

  React.useEffect(() => {
    if (isInView) {
      animate(
        'span',
        {
          opacity: 1,
          filter: filter ? 'blur(0px)' : 'none',
        },
        {
          duration: duration,
          delay: stagger(0.2),
        }
      );
    }
  }, [isInView, animate, duration, filter]);

  const renderWords = () => (
    <motion.div ref={scope}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className="opacity-0"
          style={{
            filter: filter ? 'blur(10px)' : 'none',
          }}
        >
          {word}{' '}
        </motion.span>
      ))}
    </motion.div>
  );

  return (
    <div className={cn('font-bold', className)}>
      <div className="mt-4">
        <div className="text-foreground text-2xl leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
}

interface FadeInTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function FadeInText({ text, className, delay = 0 }: FadeInTextProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {text}
    </motion.p>
  );
}
