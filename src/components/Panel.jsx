// Panel.jsx — the frame around one chart: a small tag (Q1/Q2/Q3), a title, and the chart itself.
// Keeping this in one component means all three views look consistent (Similarity principle).

// A component is a function that receives "props" (inputs) and returns JSX (what to draw).
//   tag      = which research question this view answers, e.g. "Q1"
//   title    = short heading
//   subtitle = one line saying what is encoded
//   children = whatever is placed between <Panel> ... </Panel> (the chart)
//   className = optional extra CSS class (used to place the panel in the grid)
export default function Panel({ tag, title, subtitle, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel__head">
        <span className="panel__tag">{tag}</span>
        <h2 className="panel__title">{title}</h2>
        <p className="panel__sub">{subtitle}</p>
      </header>
      {/* panel__body takes all the remaining height; the chart measures itself inside it */}
      <div className="panel__body">{children}</div>
    </section>
  );
}
