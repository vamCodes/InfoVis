// Legend.jsx — the strip at the bottom of the sketch: "color = genre, size = Spotify popularity".
// Every visual rule on the scatterplot is explained here so the viewer never has to guess.

import { GENRES, radius, MISSING_RADIUS } from '../constants.js';

// Three example popularity values to draw as reference circles.
const SIZE_SAMPLES = [20, 50, 80];

export default function Legend() {
  return (
    <footer className="legend">
      {/* ---- 1. Color = genre ---- */}
      <div className="legend__block">
        <span className="legend__title">Color · genre</span>
        <ul className="legend__list">
          {GENRES.map((g) => (
            <li key={g.key} className="legend__item">
              <span className="legend__dot" style={{ background: g.color }} />
              {g.label}
            </li>
          ))}
        </ul>
      </div>

      {/* ---- 2. Size = Spotify popularity (drawn with the SAME radius scale as the dots) ---- */}
      <div className="legend__block">
        <span className="legend__title">Size · Spotify popularity</span>
        <svg width="250" height="34" viewBox="0 0 250 34" role="img" aria-label="Dot size legend">
          {SIZE_SAMPLES.map((v, i) => {
            const cx = 16 + i * 64;                     // spread the three circles horizontally
            return (
              <g key={v}>
                <circle cx={cx} cy="17" r={radius(v)} className="legend__circle" />
                <text x={cx + radius(v) + 4} y="21" className="legend__num">{v}</text>
              </g>
            );
          })}
          {/* hollow dashed circle = missing value */}
          <circle cx="212" cy="17" r={MISSING_RADIUS} className="legend__circle legend__circle--missing" />
        </svg>
        <span className="legend__note">hollow = no Spotify data (18 albums)</span>
      </div>

      {/* ---- 3. The diagonal ---- */}
      <div className="legend__block">
        <span className="legend__title">Diagonal · no change</span>
        <span className="legend__note">
          Above the dashed line the album <b>rose</b> from 2003 to 2020; below it, it <b>fell</b>.
        </span>
      </div>
    </footer>
  );
}
