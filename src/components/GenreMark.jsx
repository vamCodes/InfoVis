import { shapeOf } from '../constants.js';

export function markerPath(shape, cx, cy, radius) {
  const p = (x, y) => `${(cx + x * radius).toFixed(2)},${(cy + y * radius).toFixed(2)}`;
  if (shape === 'circle') return null;
  if (shape === 'triangle') return `M${p(0, -1)} L${p(0.92, 0.72)} L${p(-0.92, 0.72)} Z`;
  if (shape === 'diamond') return `M${p(0, -1)} L${p(1, 0)} L${p(0, 1)} L${p(-1, 0)} Z`;
  if (shape === 'square') return `M${p(-0.78, -0.78)} L${p(0.78, -0.78)} L${p(0.78, 0.78)} L${p(-0.78, 0.78)} Z`;
  if (shape === 'cross') {
    const pts = [[-.35,-1],[.35,-1],[.35,-.35],[1,-.35],[1,.35],[.35,.35],[.35,1],[-.35,1],[-.35,.35],[-1,.35],[-1,-.35],[-.35,-.35]];
    return `M${pts.map(([x, y]) => p(x, y)).join(' L')} Z`;
  }
  if (shape === 'star') {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const r = i % 2 ? 0.43 : 1;
      return p(Math.cos(a) * r, Math.sin(a) * r);
    });
    return `M${pts.join(' L')} Z`;
  }
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 3;
    return p(Math.cos(a) * 0.9, Math.sin(a) * 0.9);
  });
  return `M${pts.join(' L')} Z`;
}

export default function GenreMark({ genre, size = 12, className = '' }) {
  const shape = shapeOf(genre.key);
  const mid = size / 2;
  const r = size * 0.42;
  const path = markerPath(shape, mid, mid, r);
  return (
    <svg className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {path ? <path d={path} fill={genre.color} /> : <circle cx={mid} cy={mid} r={r} fill={genre.color} />}
    </svg>
  );
}
