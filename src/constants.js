// constants.js — the "design decisions" file.
// Anything that more than one chart must agree on lives here, so the scatterplot, bar chart,
// line chart and legend can never drift apart (one source of truth).

import { scaleSqrt } from 'd3';   // D3 scale: maps a number range to another number range (square-root version)

// ---------------------------------------------------------------------------
// GENRES: the 7 categories of the `genre_group` column (5 genres + Other + Unknown).
// Why 7? Viewers cannot reliably tell more than ~7 hues apart (professor's feedback).
// Color HUE is used because genre is categorical with no order (expressiveness principle).
//   key   = exactly the text stored in albums_clean.json
//   label = shorter text shown on screen
//   color = fill color. "Other" and "Unknown" are muted grays on purpose: they are
//           catch-all buckets, so they should not compete with the five real genres.
// The array order is also the display order (most albums first, catch-alls last).
// ---------------------------------------------------------------------------
export const GENRES = [
  { key: 'Punk/Post-Punk/New Wave/Power Pop',   label: 'Punk / New Wave',     color: '#e4572e' },
  { key: 'Soul/Gospel/R&B',                      label: 'Soul / Gospel / R&B', color: '#f0a202' },
  { key: 'Blues/Blues Rock',                     label: 'Blues',               color: '#2f5fb3' },
  { key: 'Country/Folk/Country Rock/Folk Rock',  label: 'Country / Folk',      color: '#2e9d6a' },
  { key: 'Indie/Alternative Rock',               label: 'Indie / Alternative', color: '#8a4fc7' },
  { key: 'Other',                                label: 'Other',               color: '#8a867c' },
  { key: 'Unknown',                              label: 'Unknown',             color: '#c4bdaa' },
];

// Look up a genre's color from its key, e.g. colorOf('Soul/Gospel/R&B') -> '#f0a202'.
// Object.fromEntries turns [[key, color], ...] into { key: color, ... } for fast lookup.
const COLOR_BY_KEY = Object.fromEntries(GENRES.map((g) => [g.key, g.color]));
export const colorOf = (genreKey) => COLOR_BY_KEY[genreKey] ?? '#c4bdaa';

// Same idea for the short label.
const LABEL_BY_KEY = Object.fromEntries(GENRES.map((g) => [g.key, g.label]));
export const labelOf = (genreKey) => LABEL_BY_KEY[genreKey] ?? genreKey;

// ---------------------------------------------------------------------------
// GENDERS: options for the gender filter.
//   match = which raw `artist_gender` values the option keeps. null means "keep everything".
// "Mixed" is my label for the dataset's "Male/Female" value (bands with members of both).
// ---------------------------------------------------------------------------
export const GENDERS = [
  { key: 'All',    match: null },
  { key: 'Female', match: ['Female'] },
  { key: 'Male',   match: ['Male'] },
  { key: 'Mixed',  match: ['Male/Female'] },
];

// ---------------------------------------------------------------------------
// DOT SIZE: Spotify popularity -> circle radius.
// Stevens' power law: people judge AREA imprecisely, so size is only a SECONDARY channel.
// scaleSqrt makes radius proportional to the square root of the value, which makes the
// circle's AREA proportional to the value (doubling popularity doubles the area).
//   domain [0, 100]  = Spotify popularity is defined on a 0-100 scale
//   range  [0, 9]    = radius in pixels (was 14; smaller dots overlap less)
// ---------------------------------------------------------------------------
export const radius = scaleSqrt().domain([0, 100]).range([0, 9]);

// 18 albums have no Spotify popularity. They get a fixed small radius and are drawn hollow,
// so "missing" is visibly different from "low popularity".
export const MISSING_RADIUS = 3.5;

// Rank axes: both lists have 500 albums, rank 1 = best.
export const RANK_MIN = 1;
export const RANK_MAX = 500;
