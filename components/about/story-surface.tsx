import { CHAPTERS, CLOSING_LINE, journeyPathD } from "./story-data";
import "./about.css";

/*
 * Presentational surface only — zero animation logic.
 * The engine (about-experience.tsx) drives spotlight vars --sx/--sy on the
 * board, board camera transforms, and per-element [data-state] lens states.
 */

const OBJECTS = [
  {
    id: "tram",
    className: "ab-obj ab-obj--hide-mobile",
    pos: { x: 22, y: 44 },
    tilt: "-4deg",
    chapter: "kolkata",
    node: (
      <span className="ab-paperbit">
        Calcutta Tramways · Route 36 · One Fare
      </span>
    ),
  },
  {
    id: "note",
    className: "ab-obj",
    pos: { x: 52, y: 28 },
    tilt: "3deg",
    chapter: "memory",
    node: <span className="ab-paperbit ab-paperbit--bn">ঘর থেকে দূরে, ঘরের মতো</span>,
  },
  {
    id: "ticket",
    className: "ab-obj ab-obj--hide-mobile",
    pos: { x: 72, y: 20 },
    tilt: "-2deg",
    chapter: "journey",
    node: (
      <span className="ab-paperbit">Kolkata → Bengaluru · One Way · 450 km</span>
    ),
  },
  {
    id: "photo",
    className: "ab-obj",
    pos: { x: 80, y: 62 },
    tilt: "4deg",
    chapter: "bengaluru",
    node: (
      <span className="ab-paperbit ab-paperbit--photo">
        <svg
          className="ab-photo-art"
          viewBox="0 0 170 74"
          role="img"
          aria-label="Silhouette of Howrah Bridge over the Hooghly"
        >
          <rect width="170" height="74" fill="#3a3128" />
          <path
            d="M0 60 H170 M10 60 V30 M160 60 V30 M20 34 Q85 -6 150 34 M32 40 H138 M38 46 H132 M45 52 H125 M52 58 H118"
            stroke="#efe4c8"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>
      </span>
    ),
  },
  {
    id: "invite",
    className: "ab-obj",
    pos: { x: 26, y: 76 },
    tilt: "-3deg",
    chapter: "puja",
    node: (
      <span className="ab-paperbit ab-paperbit--invite">
        দুর্গা পূজা — আমন্ত্রণ · ষষ্ঠী থেকে দশমী
      </span>
    ),
  },
  {
    id: "member",
    className: "ab-obj ab-obj--hide-mobile",
    pos: { x: 68, y: 78 },
    tilt: "2.5deg",
    chapter: "sca",
    node: (
      <span className="ab-paperbit ab-paperbit--card">
        <strong>Sarathi Cultural Association</strong>
        Member · Est. 2003 · Bengaluru
      </span>
    ),
  },
];

function stateFor(chapterId: string): string {
  // initial paint states; the engine recomputes these every scroll frame
  return chapterId === CHAPTERS[0].id ? "active" : "future";
}

export function StorySurface() {
  const d = journeyPathD();
  return (
    <div className="ab-stage">
      <div className="ab-board" data-board>
        <div className="ab-paper" />
        <span className="ab-band ab-band--bottom" aria-hidden />
        <span className="ab-corner ab-corner--tl" aria-hidden />
        <span className="ab-corner ab-corner--tr" aria-hidden />
        <span className="ab-corner ab-corner--bl" aria-hidden />
        <span className="ab-corner ab-corner--br" aria-hidden />
        <div className="ab-fold" aria-hidden />

        {/* journey path + nodes */}
        <svg
          className="ab-path"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            data-route
            className="ab-path-route"
            d={d}
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset="100"
          />
          {CHAPTERS.map((c) => (
            <circle
              key={c.id}
              data-node={c.id}
              className="ab-node"
              cx={c.pos.x}
              cy={c.pos.y}
              r={0.55}
            />
          ))}
        </svg>

        {/* memory objects */}
        {OBJECTS.map((o) => (
          <div
            key={o.id}
            className={o.className}
            style={{
              left: `${o.pos.x}%`,
              top: `${o.pos.y}%`,
              ["--tilt" as string]: o.tilt,
            }}
            data-object={o.chapter}
            data-state={stateFor(o.chapter)}
            aria-hidden
          >
            {o.node}
          </div>
        ))}

        {/* chapters */}
        <ul className="ab-ch-list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {CHAPTERS.map((c) => (
            <li
              key={c.id}
              className="ab-ch"
              style={{ left: `${c.pos.x}%`, top: `${c.pos.y}%` }}
              data-chapter={c.id}
              data-state={stateFor(c.id)}
            >
              <article className="ab-card">
                <span className="ab-ch-bn" aria-hidden>
                  {c.titleBn}
                </span>
                <p className="ab-index">{c.index}</p>
                <p className="ab-eyebrow">{c.eyebrow}</p>
                <h2 className="ab-title">{c.titleEn}</h2>
                <div className="ab-rule" aria-hidden />
                <p className="ab-body">{c.body}</p>
              </article>
            </li>
          ))}
        </ul>

        {/* spotlight stack */}
        <div className="ab-dim" aria-hidden />
        <div className="ab-glow-broad" aria-hidden />
        <div className="ab-glow-focal" aria-hidden />
      </div>

      {/* fixed UI overlay */}
      <div className="ab-ui">
        <div className="ab-cue" data-cue aria-hidden>
          <span>Scroll</span>
          <span className="ab-cue-line" />
        </div>
        <div className="ab-progress">
          <span className="ab-progress-count" data-count>
            01 / 07
          </span>
          <div className="ab-progress-bar" aria-hidden>
            <div className="ab-progress-fill" data-fill />
          </div>
          <span className="ab-progress-label" data-label>
            Kolkata
          </span>
        </div>
      </div>

      {/* closing line — lives OUTSIDE the board so it survives the exit blackout */}
      <p data-closing className="ab-closing">
        {CLOSING_LINE}
      </p>
    </div>
  );
}
