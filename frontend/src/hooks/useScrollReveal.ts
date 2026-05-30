import { useEffect, useRef, useState } from "react";

/**
 * useScrollReveal — returns a ref and a boolean `visible`.
 * Attach `ref` to any element; `visible` becomes true when it enters the viewport.
 */
const useScrollReveal = (threshold = 0.12) => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // fire only once
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
};

export default useScrollReveal;
