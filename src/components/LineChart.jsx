// LineChart.jsx — View 3, answers Q3: "Are the albums that ROSE released more recently than the
// ones that FELL?"
//
// Encodings:
//   x position = release year   (ordinal/time; position along a common scale is the convention)
//   y position = number of albums released that year (position on a common scale)
//   line STYLE = direction: solid = rose, dashed = fell. I use line style instead of two new colors
//                because color hue is already used for genre; a third hue meaning would confuse.
//   vertical markers = the MEDIAN release year of each group. This is the direct answer to Q3:
//                if the solid marker sits to the right of the dashed one, risers are more recent.
//
// It reacts to the filters in App (genre, gender). The y axis is FIXED to the unfiltered maximum,
// so a filtered line visibly shrinks instead of being re-stretched.

import { useMemo, useRef, useState } from 'react';
import { scaleLinear, line, median, max, range } from 'd3';   // line: builds the SVG path text; median/max/range: helpers
import { useSize } from '../hooks/useSize.js';

const MARGIN = { top: 14, right: 18, bottom: 34, left: 40 };

// Year span of the 326 albums. Every album is on the 2003 list, so none were released after 2003.
const YEAR_MIN = 1955;
const YEAR_MAX = 2003;
const YEARS = range(YEAR_MIN, YEAR_MAX + 1);   // [1955, 1956, ..., 2003]  (range's end is exclusive, hence +1)

// Count albums per year for one direction. Years with no albums get 0, so the line does not skip.
function countByYear(albums, direction) {
  const counts = new Map(YEARS.map((yr) => [yr, 0]));           // start every year at 0
  for (const a of albums) {
    if (a.direction === direction) counts.set(a.release_year, counts.get(a.release_year) + 1);
  }
  return YEARS.map((yr) => ({ year: yr, n: counts.get(yr) }));  // [{year, n}, ...]
}

export default function LineChart({ albums, activeIds }) {
  const wrapRef = useRef(null);
  const { width, height } = useSize(wrapRef);
  const [hoverYear, setHoverYear] = useState(null);   // year under the mouse, or null

  // ---- 1. Data ----
  // `shown` = albums that pass the filters. `series` = the two lines. `medians` = the two markers.
  const { series, medians, yMax } = useMemo(() => {
    const shown = albums.filter((a) => activeIds.has(a.id));
    const riseAll = countByYear(albums, 'rose');   // unfiltered, only used to fix the y-axis height
    const fellAll = countByYear(albums, 'fell');
    return {
      series: [
        { key: 'rose', label: 'rose ▲', data: countByYear(shown, 'rose') },
        { key: 'fell', label: 'fell ▼', data: countByYear(shown, 'fell') },
      ],
      medians: {
        // median() returns undefined for an empty list, so a filter that removes everyone draws no marker.
        rose: median(shown.filter((a) => a.direction === 'rose'), (a) => a.release_year),
        fell: median(shown.filter((a) => a.direction === 'fell'), (a) => a.release_year),
      },
      yMax: max([...riseAll, ...fellAll], (d) => d.n) ?? 1,
    };
  }, [albums, activeIds]);

  // ---- 2. Geometry and scales ----
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  const x = scaleLinear().domain([YEAR_MIN, YEAR_MAX]).range([MARGIN.left, MARGIN.left + innerW]);
  // y: 0 at the bottom, yMax at the top. Range is [bottom, top] because SVG y grows downward.
  const y = scaleLinear().domain([0, yMax]).range([MARGIN.top + innerH, MARGIN.top]).nice();

  // `line()` turns a list of points into the text of an SVG <path>. We tell it how to get x and y.
  const makePath = line()
    .x((d) => x(d.year))
    .y((d) => y(d.n));

  const ready = innerW > 0 && innerH > 0;

  // ---- 3. Hover: convert the mouse position back into a year ----
  const onMove = (e) => {
    const box = wrapRef.current.getBoundingClientRect();
    const mx = e.clientX - box.left;                           // mouse x inside the chart
    const yr = Math.round(x.invert(mx));                       // invert = pixels -> data value
    setHoverYear(Math.min(YEAR_MAX, Math.max(YEAR_MIN, yr)));  // clamp to the valid range
  };

  // Numbers for the tooltip at the hovered year.
  const hoverData =
    hoverYear == null
      ? null
      : {
          year: hoverYear,
          rose: series[0].data[hoverYear - YEAR_MIN].n,
          fell: series[1].data[hoverYear - YEAR_MIN].n,
        };

  return (
    <div className="chart" ref={wrapRef}>
      {ready && (
        <svg width={width} height={height} role="img" aria-label="Line chart: albums per release year, risers versus fallers">
          {/* ---------- Axes ---------- */}
          {y.ticks(4).map((t) => (
            <g key={t}>
              <line x1={MARGIN.left} x2={MARGIN.left + innerW} y1={y(t)} y2={y(t)} className="plot__grid" />
              <text x={MARGIN.left - 8} y={y(t) + 4} textAnchor="end" className="plot__tick">{t}</text>
            </g>
          ))}
          {[1955, 1965, 1975, 1985, 1995, 2003].map((t) => (
            <text key={t} x={x(t)} y={MARGIN.top + innerH + 16} textAnchor="middle" className="plot__tick">{t}</text>
          ))}
          <text x={MARGIN.left + innerW / 2} y={height - 3} textAnchor="middle" className="plot__axis">
            release year
          </text>
          <text transform={`translate(11 ${MARGIN.top + innerH / 2}) rotate(-90)`} textAnchor="middle" className="plot__axis">
            albums
          </text>
          <line x1={MARGIN.left} x2={MARGIN.left + innerW} y1={y(0)} y2={y(0)} className="bar__axis" />

          {/* ---------- Median markers (the answer to Q3) ---------- */}
          {['rose', 'fell'].map((k, i) =>
            medians[k] == null ? null : (
              <g key={k}>
                <line
                  x1={x(medians[k])} x2={x(medians[k])}
                  y1={MARGIN.top} y2={y(0)}
                  className={`line__median line__median--${k}`}
                />
                {/* Label sits beside its marker; the second label is lower so they never overlap. */}
                {/* In the right 35% of the chart the label would run off the edge, so it is
                    anchored to its END and written to the LEFT of the marker instead. */}
                <text
                  x={x(medians[k]) + (x(medians[k]) > width * 0.65 ? -5 : 5)}
                  textAnchor={x(medians[k]) > width * 0.65 ? 'end' : 'start'}
                  y={MARGIN.top + 11 + i * 13}
                  className={`line__medlabel line__medlabel--${k}`}
                >
                  {k === 'rose' ? '▲' : '▼'} median {medians[k]}
                </text>
              </g>
            )
          )}

          {/* ---------- The two lines ---------- */}
          {series.map((s) => (
            <path key={s.key} d={makePath(s.data)} className={`line__path line__path--${s.key}`} />
          ))}

          {/* ---------- Hover guide: a vertical rule and a dot on each line ---------- */}
          {hoverData && (
            <g pointerEvents="none">
              <line x1={x(hoverData.year)} x2={x(hoverData.year)} y1={MARGIN.top} y2={y(0)} className="line__guide" />
              <circle cx={x(hoverData.year)} cy={y(hoverData.rose)} r="4" className="line__pt line__pt--rose" />
              <circle cx={x(hoverData.year)} cy={y(hoverData.fell)} r="4" className="line__pt line__pt--fell" />
            </g>
          )}

          {/* Invisible rectangle on top that catches the mouse over the whole plot. */}
          <rect
            x={MARGIN.left} y={MARGIN.top} width={innerW} height={innerH}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHoverYear(null)}
          />
        </svg>
      )}

      {/* ---------- Tooltip (plain HTML) ---------- */}
      {ready && hoverData && (
        <div
          className="tooltip tooltip--small"
          style={{
            left: x(hoverData.year),
            top: MARGIN.top + innerH * 0.35,
            // flip to the left of the guide in the right half so it stays inside the panel
            transform: `translateX(${x(hoverData.year) > width / 2 ? 'calc(-100% - 12px)' : '12px'})`,
          }}
        >
          <div className="tooltip__title">{hoverData.year}</div>
          <div className="tooltip__row">▲ rose: <b>{hoverData.rose}</b> {hoverData.rose === 1 ? 'album' : 'albums'}</div>
          <div className="tooltip__row">▼ fell: <b>{hoverData.fell}</b> {hoverData.fell === 1 ? 'album' : 'albums'}</div>
        </div>
      )}
    </div>
  );
}
