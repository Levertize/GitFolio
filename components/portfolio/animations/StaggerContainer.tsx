"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delay?: number;
  className?: string;
}

export default function StaggerContainer({
  children,
  staggerDelay = 0.08,
  delay = 0,
  className,
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const prefersReduced = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}
