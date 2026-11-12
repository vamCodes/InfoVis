// useSize.js — measures how many pixels wide/tall an element is, and updates when it changes.
// Charts need this: the SVG must know its pixel size to compute scales (data -> pixels).

import { useEffect, useState } from 'react';

// `ref` is a React reference to a real DOM element (created with useRef in the component).
export function useSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;      // the actual <div> on the page
    if (!element) return;             // not on screen yet -> nothing to measure

    // ResizeObserver is a browser feature that calls us whenever the element's size changes
    // (window resized, panel layout changed, ...).
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;   // size of the element's content box
      setSize({ width, height });                    // store it -> component re-renders
    });
    observer.observe(element);

    return () => observer.disconnect();   // stop watching when the component goes away
  }, [ref]);

  return size;   // { width, height } in pixels
}
