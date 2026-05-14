import { useEffect, useState } from 'react';

export function useCountUp(
  target: number, 
  duration: number = 1200,
  startOnMount: boolean = true
) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!startOnMount) return;
    
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      if (elapsed < duration) {
        // progress: 0 -> 1 using easeOutExpo/Quart-ish formula
        const progress = 1 - Math.pow(1 - elapsed / duration, 4);
        setCount(Math.floor(progress * target));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, startOnMount]);
  
  return count;
}
