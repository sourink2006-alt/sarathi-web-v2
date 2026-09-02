import { HERO } from "./events-data";

/*
 * Events hero — cinematic typographic opening. Pure presentation; the
 * entrance animation is driven from events-page.tsx via [data-hero-el].
 */
export function EventsHero() {
  return (
    <header className="ev-hero">
      <div className="ev-hero-inner">
        <p data-hero-el className="ev-kicker">
          {HERO.kicker}
        </p>
        <h1 data-hero-el className="ev-hero-title">
          {HERO.title}
        </h1>
        <p data-hero-el className="ev-hero-sub">
          {HERO.sub}
        </p>
        <div data-hero-el className="ev-hero-dates">
          <strong>{HERO.dates}</strong>
        </div>
        <div data-hero-el className="ev-rule" aria-hidden />
        <p data-hero-el className="ev-hero-tags">
          {HERO.tags.join("  ·  ")}
        </p>
        <p data-hero-el className="ev-hero-loc">
          {HERO.location}
        </p>
      </div>

      <span className="ev-hero-bn" aria-hidden>
        {HERO.bn}
      </span>

      <span className="ev-corner ev-corner--tl" aria-hidden />
      <span className="ev-corner ev-corner--tr" aria-hidden />
      <span className="ev-corner ev-corner--bl" aria-hidden />
      <span className="ev-corner ev-corner--br" aria-hidden />

      <span className="ev-hero-band" aria-hidden />
    </header>
  );
}