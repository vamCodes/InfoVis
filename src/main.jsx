// main.jsx — the entry point. It runs first and mounts React onto the page.
import { StrictMode } from 'react';              // StrictMode = extra development-time warnings (no effect in production)
import { createRoot } from 'react-dom/client';   // createRoot connects React to a real DOM element
import App from './App.jsx';                     // our top-level component (the whole dashboard)
import './styles.css';                           // global styles; Vite injects them into the page

// Find <div id="root"> in index.html and render <App /> inside it.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
