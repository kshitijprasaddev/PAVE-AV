"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import type { ReactNode } from "react";

type BaseRevealProps = {
  as?: keyof typeof motion;
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ as = "div", children, className, delay = 0 }: BaseRevealProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.18 });
  const Component = (motion[as] ?? motion.div) as typeof motion.div;

  return (
    <Component
      ref={ref as never}
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Component>
  );
}

type RevealStackProps = {
  items: ReactNode[];
  initialDelay?: number;
  step?: number;
  className?: string;
};

export function RevealStack({ items, initialDelay = 0, step = 0.08, className }: RevealStackProps) {
  return (
    <>
      {items.map((item, index) => (
        <Reveal key={index} delay={initialDelay + index * step} className={className}>
          {item}
        </Reveal>
      ))}
    </>
  );
}
