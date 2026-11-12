// Scatterplot.jsx — View 1, answers Q1: "Which albums moved up or down the most, and what genres?"
//
// Encodings (each one is justified in the channel table of the proposal):
//   x position  = 2003 rank   (position on a common scale = most accurate channel for numbers)
//   y position  = 2020 rank   (same reason; rank 1 is at the TOP of both axes)
//   color hue   = genre group (categorical, no order -> hue)
//   size (area) = Spotify popularity (secondary variable, Stevens' power law)
//   dashed diagonal = "no change" line: above it an album rose, below it fell
//
// How React and D3 share the work here (important to explain!):
//   D3 does the MATH  -> scales that turn a rank (1-500) into a pixel position.
//   React does the DRAWING -> it returns <circle> elements, one per album.
// D3 never touches the page directly, so the two libraries cannot fight over the same elements.

import { useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3';                    // scaleLinear: maps a number range to a pixel range
import { useSize } from '../hooks/useSize.js';
import { colorOf, radius, MISSING_RADIUS, RANK_MIN, RANK_MAX } from '../constants.js';

// Space (in pixels) reserved around the plot for axis numbers and labels.
const MARGIN = { top: 18, right: 22, bottom: 50, left: 58 };

// Axis tick values. Fixed so the axes read the same at every window size.
const TICKS = [1, 100, 200, 300, 400, 500];

// Props:
//   albums    = ALL 326 albums (so dots keep their position when a filter is applied)
//   activeIds = Set of album ids that pass the current filters; the others are dimmed
export default function Scatterplot({ albums, activeIds }) {
  // `wrapRef` points at the <div> that wraps the SVG; we measure it to size the chart.
  const wrapRef = useRef(null);
  const { width, height } = useSize(wrapRef);

  // `hover` remembers which dot the mouse is over (or null) plus the mouse position, for the tooltip.
  const [hover, setHover] = useState(null);

  // ---- 1. Geometry: make the plot area a SQUARE so the "no change" diagonal is a true 45 degrees ----
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);    // free width after margins
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom);   // free height after margins
  const side = Math.min(innerW, innerH);                              // square side = the smaller one
  const left = MARGIN.left + (innerW - side) / 2;                     // centre the square horizontally
  const top = MARGIN.top;                                             // square sits at the top margin

  // ---- 2. Scales: functions that convert data values into pixels ----
  // x(2003 rank): rank 1 -> left edge, rank 500 -> right edge.
  // y(2020 rank): rank 1 -> TOP edge, rank 500 -> bottom edge (range is [top, top + side], not reversed,
  //               because SVG's y axis already grows downward, which is what we want for "1 = best").
  // useMemo = only rebuild the scale when its inputs change (cheaper than every render).
  const x = useMemo(
    () => scaleLinear().domain([RANK_MIN, RANK_MAX]).range([left, left + side]),
    [left, side]
  );
  const y = useMemo(
    () => scaleLinear().domain([RANK_MIN, RANK_MAX]).range([top, top + side]),
    [top, side]
  );

  // ---- 3. Draw order: big dots first, small dots last, so small dots are never buried ----
  // [...albums] copies the array (sort() would otherwise change the original).
  // (b - a) sorts from high popularity to low; missing popularity (null) counts as -1 = drawn last.
  const ordered = useMemo(
    () => {
      // 1) Quiet dots (Other/Unknown) are drawn FIRST, so the 5 colored genres sit on top of them.
      // 2) Within each group, big dots first and small dots last, so small dots are never buried.
      const isQuiet = (a) => (a.genre_group === 'Other' || a.genre_group === 'Unknown' ? 0 : 1);
      return [...albums].sort(
        (a, b) =>
          isQuiet(a) - isQuiet(b) ||
          (b.spotify_popularity ?? -1) - (a.spotify_popularity ?? -1)
      );
    },
    [albums]
  );

  // Before the container has been measured there is nothing to draw yet; still render the wrapper
  // so useSize has an element to observe.
  const ready = side > 0;

  return (
    <div className="chart" ref={wrapRef}>
      {ready && (
        <svg width={width} height={height} role="img" aria-label="Scatterplot of 2003 rank versus 2020 rank">
          {/* ---------- Background square + light gridlines ---------- */}
          <rect x={left} y={top} width={side} height={side} className="plot__bg" />

          {TICKS.map((t) => (
            <g key={t}>
              {/* vertical gridline at x = t */}
              <line x1={x(t)} x2={x(t)} y1={top} y2={top + side} className="plot__grid" />
              {/* horizontal gridline at y = t */}
              <line x1={left} x2={left + side} y1={y(t)} y2={y(t)} className="plot__grid" />
              {/* x-axis number under the plot */}
              <text x={x(t)} y={top + side + 18} textAnchor="middle" className="plot__tick">{t}</text>
              {/* y-axis number left of the plot */}
              <text x={left - 10} y={y(t) + 4} textAnchor="end" className="plot__tick">{t}</text>
            </g>
          ))}

          {/* ---------- Axis titles ---------- */}
          <text x={left + side / 2} y={top + side + 40} textAnchor="middle" className="plot__axis">
            2003 rank (1 = best) →
          </text>
          {/* rotate(-90) turns the y title sideways; its centre is placed at (16, middle of the plot) */}
          <text
            transform={`translate(16 ${top + side / 2}) rotate(-90)`}
            textAnchor="middle"
            className="plot__axis"
          >
            2020 rank (1 = best) →
          </text>

          {/* ---------- The "no change" diagonal: from (rank 1, rank 1) to (rank 500, rank 500) ---------- */}
          <line x1={x(RANK_MIN)} y1={y(RANK_MIN)} x2={x(RANK_MAX)} y2={y(RANK_MAX)} className="plot__diagonal" />
          <text x={left + side - 8} y={top + 20} textAnchor="end" className="plot__zone">
            ROSE IN 2020 ↑
          </text>
          <text x={left + 8} y={top + side - 10} className="plot__zone">
            FELL IN 2020 ↓
          </text>

          {/* ---------- The dots: one <circle> per album ---------- */}
          {ordered.map((d) => {
            const missing = d.spotify_popularity == null;     // null or undefined -> no Spotify data
            const active = activeIds.has(d.id);                // does it pass the current filters?
            const color = colorOf(d.genre_group);
            // "Other" and "Unknown" are catch-all buckets (164 of 326 dots). Drawing them quieter
            // (lighter fill, thinner outline) keeps them visible but lets the 5 real genres stand out.
            const quiet = d.genre_group === 'Other' || d.genre_group === 'Unknown';
            return (
              <circle
                key={d.id}                                      // unique id -> React can track each dot
                cx={x(d.rank_2003)}                             // x pixel from 2003 rank
                cy={y(d.rank_2020)}                             // y pixel from 2020 rank
                r={missing ? MISSING_RADIUS : radius(d.spotify_popularity)}   // size from popularity
                fill={color}                                    // hue from genre
                fillOpacity={missing ? 0.08 : quiet ? 0.35 : 0.7}   // quiet < normal; see-through so stacked dots show as darker areas
                stroke={missing ? color : quiet ? 'var(--ink-soft)' : 'var(--ink)'}   // missing: outline in genre color
                strokeWidth={missing ? 2 : quiet ? 0.4 : 0.6}
                className={`dot ${active ? '' : 'dot--dim'}`}   // dot--dim fades filtered-out albums
                pointerEvents={active ? 'all' : 'none'}         // faded dots cannot be hovered
                onMouseMove={(e) => {
                  // Mouse position relative to the chart wrapper (for placing the tooltip).
                  const box = wrapRef.current.getBoundingClientRect();
                  setHover({ d, mx: e.clientX - box.left, my: e.clientY - box.top });
                }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}

          {/* A thick ring around the hovered dot so it is easy to see which one you are on. */}
          {hover && (
            <circle
              cx={x(hover.d.rank_2003)}
              cy={y(hover.d.rank_2020)}
              r={(hover.d.spotify_popularity == null ? MISSING_RADIUS : radius(hover.d.spotify_popularity)) + 3}
              className="dot__ring"
              pointerEvents="none"
            />
          )}
        </svg>
      )}

      {/* ---------- Tooltip: normal HTML positioned over the chart ---------- */}
      {hover && (
        <div
          className="tooltip"
          style={{
            left: hover.mx,
            top: hover.my,
            // flip to the left of the cursor in the right half so it never leaves the panel
            transform: `translate(${hover.mx > width / 2 ? 'calc(-100% - 14px)' : '14px'}, 14px)`,
          }}
        >
          <div className="tooltip__title">{hover.d.album}</div>
          <div className="tooltip__artist">{hover.d.clean_name} · {hover.d.release_year}</div>
          <div className="tooltip__row">
            2003 <b>#{hover.d.rank_2003}</b> → 2020 <b>#{hover.d.rank_2020}</b>
          </div>
          <div className="tooltip__row">
            {/* rank_change > 0 means it rose, so show a + sign; negative numbers already carry a minus */}
            {hover.d.rank_change > 0 ? '▲ rose' : hover.d.rank_change < 0 ? '▼ fell' : '● no change'}
            {hover.d.rank_change !== 0 && <b> {Math.abs(hover.d.rank_change)} places</b>}
          </div>
          <div className="tooltip__row">
            <span className="tooltip__sw" style={{ background: colorOf(hover.d.genre_group) }} />
            {hover.d.genre === 'Unknown' ? 'Genre unknown' : hover.d.genre}
          </div>
          <div className="tooltip__row">
            Spotify popularity: <b>{hover.d.spotify_popularity ?? 'n/a'}</b>
          </div>
        </div>
      )}
    </div>
  );
}
