// App.jsx — the top-level component. It does three jobs:
//   1. loads the data,
//   2. owns the SHARED STATE (the current filters) that every chart reads,
//   3. lays out the dashboard exactly like the sketch.
//
// Sketch layout (top to bottom):
//   title  ->  filter bar  ->  [ scatterplot | bar chart over line chart ]  ->  legend
// One thick border (.frame) encloses everything  (Gestalt: enclosure).

import { useMemo, useState } from 'react';
import { useAlbums } from './hooks/useAlbums.js';
import { GENDERS } from './constants.js';
import Panel from './components/Panel.jsx';
import FilterBar from './components/FilterBar.jsx';
import Legend from './components/Legend.jsx';
import Scatterplot from './components/Scatterplot.jsx';
import BarChart from './components/BarChart.jsx';
import LineChart from './components/LineChart.jsx';

export default function App() {
  // ---- Data ----
  const { albums, loading, error } = useAlbums();   // albums = array of 326 objects from the JSON

  // ---- Shared state: what the user has chosen in the filter bar ----
  // When either value changes, React re-renders App and everything below it.
  const [genre, setGenre] = useState('All');        // 'All' or a genre_group key
  const [gender, setGender] = useState('All');      // 'All' | 'Female' | 'Male' | 'Mixed'

  // ---- Derived data: which albums pass BOTH filters? ----
  // We store only their ids in a Set (fast "is this id in here?" checks).
  // useMemo recomputes this only when albums, genre or gender change.
  const activeIds = useMemo(() => {
    const genderRule = GENDERS.find((o) => o.key === gender);          // e.g. { key:'Female', match:['Female'] }
    const passing = albums.filter((a) => {
      const genreOk = genre === 'All' || a.genre_group === genre;       // genre filter
      const genderOk = genderRule.match === null || genderRule.match.includes(a.artist_gender);  // gender filter
      return genreOk && genderOk;                                       // must satisfy both
    });
    return new Set(passing.map((a) => a.id));
  }, [albums, genre, gender]);

  // ---- Summary numbers for the header readout (also computed from the filtered albums) ----
  const stats = useMemo(() => {
    const shown = albums.filter((a) => activeIds.has(a.id));
    return {
      total: shown.length,
      rose: shown.filter((a) => a.direction === 'rose').length,
      fell: shown.filter((a) => a.direction === 'fell').length,
    };
  }, [albums, activeIds]);

  // Put every filter back to its starting value.
  const resetAll = () => {
    setGenre('All');
    setGender('All');
  };

  // ---- Early returns while data is loading or failed ----
  if (loading) return <div className="message">Loading albums…</div>;
  if (error) {
    return (
      <div className="message message--error">
        Could not load data/albums_clean.json ({error}). Check that the file is in public/data/.
      </div>
    );
  }

  // ---- The dashboard ----
  return (
    <main className="frame">
      {/* ===== Title band ===== */}
      <header className="masthead">
        <div>
          <p className="masthead__kicker"></p>
          <h1 className="masthead__title">
            Rolling Stone’s 500 Greatest Albums
            <span className="masthead__vs">2003 <i>vs</i> 2020</span>
          </h1>
        </div>

        {/* Live readout: changes with the filters */}
        <dl className="readout">
          <div><dt>albums shown</dt><dd>{stats.total}</dd></div>
          <div><dt>rose ▲</dt><dd>{stats.rose}</dd></div>
          <div><dt>fell ▼</dt><dd>{stats.fell}</dd></div>
        </dl>
      </header>

      {/* ===== Filter band ===== */}
      <FilterBar
        genre={genre}
        onGenre={setGenre}
        gender={gender}
        onGender={setGender}
        onReset={resetAll}
      />

      {/* ===== Three views in a CSS grid: scatterplot spans both rows on the left ===== */}
      <div className="dash">
        <Panel
          className="dash__scatter"
          tag="Q1"
          title="Who moved the most?"
          subtitle="x: 2003 rank · y: 2020 rank · color: genre · size: Spotify popularity"
        >
          <Scatterplot albums={albums} activeIds={activeIds} />
        </Panel>

        <Panel
          className="dash__bar"
          tag="Q2"
          title="Which genres dominate?"
          subtitle="albums per genre · dashed outline = count with no filter · click a bar to filter"
        >
          {/* selectedGenre + onSelectGenre let a click on a bar change the SAME genre filter the chips use */}
          <BarChart
            albums={albums}
            activeIds={activeIds}
            selectedGenre={genre}
            onSelectGenre={setGenre}
          />
        </Panel>

        <Panel
          className="dash__line"
          tag="Q3"
          title="Did risers come later?"
          subtitle="albums per release year · solid = rose, dashed = fell · markers = median year"
        >
          <LineChart albums={albums} activeIds={activeIds} />
        </Panel>
      </div>

      {/* ===== Legend band ===== */}
      <Legend />
    </main>
  );
}
