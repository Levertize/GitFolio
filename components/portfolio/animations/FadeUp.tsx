"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
}

export default function FadeUp({ 
  children, 
  delay = 0, 
  className, 
  duration = 0.5 
}: FadeUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const prefersReduced = typeof window !== "undefined" 
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
    : false;

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
