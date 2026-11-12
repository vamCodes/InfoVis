// BarChart.jsx — View 2, answers Q2: "Which genres are most represented, and how does that
// change when I filter to female artists?"
//
// Encodings:
//   bar LENGTH = number of albums   (position on a common scale = most accurate channel for counts)
//   bar COLOR  = genre group        (same hue as the scatterplot dots, so no extra legend is needed)
//   dashed OUTLINE behind each bar  = the count with NO filter, so you SEE what the filter removed
//
// Interaction (this is a cross-view link):
//   * It reacts to the filters held in App (the bars shrink when you pick Female).
//   * Clicking a bar sets the genre filter, which fades the other dots on the scatterplot.
//
// D3 does the math (scales); React draws the <rect> and <text> elements.

import { useMemo, useRef } from 'react';
import { scaleBand, scaleLinear } from 'd3';   // scaleBand: one slot per category; scaleLinear: number -> pixels
import { useSize } from '../hooks/useSize.js';
import { GENRES } from '../constants.js';

// Room (pixels) around the plot for genre names (left) and the count axis (bottom).
// left was 118 and clipped long names like "Soul / Gospel / R&B"; DM Mono is a WIDE font (~7px per
// character), so 19 characters need about 135px. 150 leaves a safe gap before the bars start.
const MARGIN = { top: 10, right: 62, bottom: 32, left: 150 };

// Props:
//   albums        = all 326 albums
//   activeIds     = Set of ids that pass the current filters
//   selectedGenre = current genre filter ('All' or a genre_group key)
//   onSelectGenre = function from App that changes the genre filter
export default function BarChart({ albums, activeIds, selectedGenre, onSelectGenre }) {
  const wrapRef = useRef(null);
  const { width, height } = useSize(wrapRef);

  // ---- 1. Count albums per genre: `total` ignores filters, `shown` respects them ----
  const rows = useMemo(
    () =>
      GENRES.map((g) => {
        const inGenre = albums.filter((a) => a.genre_group === g.key);   // every album of this genre
        return {
          ...g,                                                           // key, label, color
          total: inGenre.length,                                          // count with no filter
          shown: inGenre.filter((a) => activeIds.has(a.id)).length,       // count after filters
        };
      }),
    [albums, activeIds]
  );

  // ---- 2. Geometry ----
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  // ---- 3. Scales ----
  // y: one horizontal slot per genre, in the order of the GENRES array (catch-alls last).
  //    padding 0.28 = gap between bars.
  const y = scaleBand()
    .domain(rows.map((r) => r.key))
    .range([MARGIN.top, MARGIN.top + innerH])
    .padding(0.28);

  // x: count -> pixels. The domain is FIXED to the largest unfiltered count, so the axis does NOT
  // rescale when you filter; a filtered bar is visibly shorter instead of being stretched back.
  // It starts at 0 (a bar's length must start at zero or the comparison is dishonest).
  const maxTotal = Math.max(...rows.map((r) => r.total), 1);
  const x = scaleLinear().domain([0, maxTotal]).range([MARGIN.left, MARGIN.left + innerW]);

  const ready = innerW > 0 && innerH > 0;

  return (
    <div className="chart" ref={wrapRef}>
      {ready && (
        <svg width={width} height={height} role="img" aria-label="Bar chart: number of albums per genre">
          {/* ---------- Count axis: light vertical gridlines + numbers ---------- */}
          {x.ticks(4).map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={MARGIN.top} y2={MARGIN.top + innerH} className="plot__grid" />
              <text x={x(t)} y={MARGIN.top + innerH + 16} textAnchor="middle" className="plot__tick">{t}</text>
            </g>
          ))}
          <text x={MARGIN.left + innerW / 2} y={height - 4} textAnchor="middle" className="plot__axis">
            number of albums
          </text>

          {/* ---------- One row per genre ---------- */}
          {rows.map((r) => {
            const yy = y(r.key);                 // top pixel of this row's slot
            const h = y.bandwidth();             // height of one bar
            const selected = selectedGenre === r.key;
            const filtered = r.shown !== r.total; // did a filter remove albums from this genre?
            return (
              <g
                key={r.key}
                className="bar"
                // Click toggles: click once to filter to this genre, click again to clear.
                onClick={() => onSelectGenre(selected ? 'All' : r.key)}
              >
                {/* Native browser tooltip (hover to see the exact numbers). */}
                <title>{`${r.key}: ${r.shown} of ${r.total} albums shown. Click to filter.`}</title>

                {/* Invisible full-width rectangle so the whole row is clickable, not just the thin bar. */}
                <rect x={0} y={yy - 3} width={width} height={h + 6} fill="transparent" />

                {/* Genre name on the left; bold when selected. */}
                <text
                  x={MARGIN.left - 8}
                  y={yy + h / 2 + 4}
                  textAnchor="end"
                  className={`bar__label ${selected ? 'is-on' : ''}`}
                >
                  {r.label}
                </text>

                {/* Dashed ghost bar = unfiltered count. */}
                <rect
                  x={MARGIN.left}
                  y={yy}
                  width={x(r.total) - MARGIN.left}
                  height={h}
                  className="bar__ghost"
                />

                {/* Real bar = count that passes the filters. Length comes straight from the scale. */}
                <rect
                  x={MARGIN.left}
                  y={yy}
                  width={Math.max(0, x(r.shown) - MARGIN.left)}
                  height={h}
                  fill={r.color}
                  className="bar__rect"
                />

                {/* Count printed at the end of the bar (counts can be as small as 1). */}
                <text x={x(r.total) + 6} y={yy + h / 2 + 4} className="bar__count">
                  {r.shown}
                  {filtered && <tspan className="bar__of"> / {r.total}</tspan>}
                </text>
              </g>
            );
          })}

          {/* Baseline at 0: where every bar starts. */}
          <line x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={MARGIN.top + innerH} className="bar__axis" />
        </svg>
      )}
    </div>
  );
}
