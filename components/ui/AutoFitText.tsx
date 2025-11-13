import React, { useLayoutEffect, useRef } from 'react';

interface AutoFitTextProps {
  text: string;
  min?: number; // px
  max?: number; // px
  className?: string;
}

// Auto scales font-size to fit container width. Falls back to multi-line when needed.
const AutoFitText: React.FC<AutoFitTextProps> = ({ text, min = 14, max = 28, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const fit = () => {
      const container = containerRef.current;
      const span = spanRef.current;
      if (!container || !span) return;

      // Start with nowrap to try to keep one line when possible
      span.style.whiteSpace = 'nowrap';

      const containerWidth = container.clientWidth;
      if (containerWidth === 0) return;

      // Binary search for the largest font-size that fits
      let low = min;
      let high = max;
      let best = min;

      for (let i = 0; i < 12; i++) {
        const mid = (low + high) / 2;
        span.style.fontSize = `${mid}px`;
        // Force layout read
        const fits = span.scrollWidth <= containerWidth;
        if (fits) {
          best = mid;
          low = mid + 0.1;
        } else {
          high = mid - 0.1;
        }
      }

      span.style.fontSize = `${best}px`;

      // If still doesn't fit at min size, allow wrapping so full value is visible
      if (span.scrollWidth > containerWidth) {
        span.style.whiteSpace = 'normal';
      }
    };

    const ro = new ResizeObserver(() => fit());
    if (containerRef.current) ro.observe(containerRef.current);
    // Also fit on mount
    fit();
    return () => ro.disconnect();
  }, [min, max, text]);

  return (
    <div ref={containerRef} className="w-full min-w-0">
      <span ref={spanRef} className={className} style={{ lineHeight: 1.1, display: 'inline-block' }}>
        {text}
      </span>
    </div>
  );
};

export default AutoFitText;

