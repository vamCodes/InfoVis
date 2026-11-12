// useAlbums.js — a custom "hook": a reusable function that gives a component some behaviour.
// This one loads albums_clean.json once and reports whether it is loading, failed, or ready.

import { useEffect, useState } from 'react';
// useState  = lets a component remember a value between renders (and re-render when it changes)
// useEffect = lets a component run side effects (like fetching data) after it appears on screen

export function useAlbums() {
  // One state object holding everything the caller needs.
  const [state, setState] = useState({ albums: [], loading: true, error: null });

  useEffect(() => {
    // Flag so we ignore the answer if the component disappeared before the fetch finished.
    let cancelled = false;

    // import.meta.env.BASE_URL is the 'base' from vite.config.js ('./').
    // Files in the /public folder are served from the site root, so /public/data/albums_clean.json
    // is requested as 'data/albums_clean.json'.
    fetch(`${import.meta.env.BASE_URL}data/albums_clean.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);  // 404 etc. -> go to .catch
        return response.json();                                       // parse text into JS objects
      })
      .then((rows) => {
        // Safety net: every album must have a unique `id` (some titles repeat, e.g. "Let It Be").
        // Your latest export already has one; if an older file without it is used, fall back to
        // the row number `i`. `a.id ?? i` means "use a.id, but if it is missing use i".
        const albums = rows.map((a, i) => ({ ...a, id: a.id ?? i }));
        if (!cancelled) setState({ albums, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ albums: [], loading: false, error: err.message });
      });

    // Cleanup function: React calls it when the component unmounts.
    return () => {
      cancelled = true;
    };
  }, []);   // empty [] = run this effect only once, on first render

  return state;   // { albums, loading, error }
}
