"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import { useCountUp } from "@/hooks/useCountUp";

interface StatNumberProps {
  value: number;
  suffix?: string;
  duration?: number;
}

export default function StatNumber({ value, suffix = "", duration = 1200 }: StatNumberProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useCountUp(value, duration, isInView);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return num.toString();
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(count)}
      {suffix}
    </span>
  );
}
