// vite.config.js — settings for the build tool (Vite).
import { defineConfig } from 'vite';          // helper that gives editor autocomplete for the config
import react from '@vitejs/plugin-react';     // teaches Vite how to read JSX (the HTML-like syntax in React files)

export default defineConfig({
  plugins: [react()],   // turn on JSX support
  // base './' makes every file path relative. Without it, the built site only works
  // at the root of a domain; with it, it also works on GitHub Pages (username.github.io/infowiz/).
  base: './',
});
