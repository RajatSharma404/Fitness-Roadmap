import { useEffect, useRef, useState } from "react";

/**
 * Hook for lazy loading elements with IntersectionObserver
 * Returns a ref to attach to the element and a boolean indicating if it's in view
 */
export function useLazyLoad(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Once loaded, we can stop observing
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        ...options,
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isInView };
}

/**
 * Hook for image lazy loading with blur-up placeholder
 * Transitions from placeholder to full image
 */
export function useLazyImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start with placeholder immediately
    setImageSrc(src);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setIsLoading(false);
    };

    img.onerror = () => {
      // On error, still show the image (SVG fallback will handle it)
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageSrc, isLoading };
}
