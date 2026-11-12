// FilterBar.jsx — the row of controls above the charts (sketch: [Filter: genre] [Filter: gender] [Reset]).
// It owns NO state. App.jsx holds the state and passes it down, so every chart sees the same filters.
// ("Lifting state up": the parent is the single source of truth.)

import { GENRES, GENDERS } from '../constants.js';

export default function FilterBar({ genre, onGenre, gender, onGender, onReset }) {
  return (
    <div className="filters">
      {/* ---- Genre filter: one chip per genre, plus "All" ---- */}
      <div className="filters__group">
        <span className="filters__label">Genre</span>
        <div className="chips">
          <button
            className={`chip ${genre === 'All' ? 'is-on' : ''}`}   // is-on = highlighted style
            onClick={() => onGenre('All')}                         // tell App which genre was chosen
          >
            All
          </button>

          {/* .map loops over the GENRES array and returns one <button> per item */}
          {GENRES.map((g) => (
            <button
              key={g.key}                                           // React needs a unique key per list item
              className={`chip ${genre === g.key ? 'is-on' : ''}`}
              onClick={() => onGenre(g.key)}
              title={g.key}                                         // hover shows the full dataset name
            >
              {/* small colored square = the same color used on the dots (consistent encoding) */}
              <span className="chip__swatch" style={{ background: g.color }} />
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Gender filter: a segmented control (exactly one option is active) ---- */}
      <div className="filters__group">
        <span className="filters__label">Artist gender</span>
        <div className="segmented">
          {GENDERS.map((o) => (
            <button
              key={o.key}
              className={`segmented__btn ${gender === o.key ? 'is-on' : ''}`}
              onClick={() => onGender(o.key)}
            >
              {o.key}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Reset: puts every filter back to "All" ---- */}
      <button className="reset" onClick={onReset}>
        Reset ↺
      </button>
    </div>
  );
}
