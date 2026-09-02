"use client";

import { useState } from "react";
import { Calendar, Star } from "lucide-react";
import {
  AMENITIES,
  CULTURAL_EVENTS,
  CULTURAL_HIGHLIGHT,
  RELIGIOUS_EVENTS,
  RITUALS,
  type EventItem,
} from "./events-data";
import { EventCard } from "./event-card";
import { EventCarousel } from "./event-carousel";
import { EventModal } from "./event-modal";

/*
 * Event Schedule — EVENTS → CULTURAL EVENTS (15–21 Oct) → RELIGIOUS EVENTS
 * (16–21 Oct) → BBMP Ground. Two clearly separated categories. Each event is
 * a BookMyShow-style card whose poster opens a detail modal. Cards carry only
 * date/title/short summary — full detail lives in the modal.
 */
export function ScheduleSection() {
  const [active, setActive] = useState<EventItem | null>(null);

  return (
    <section className="ev-schedule" aria-labelledby="ev-schedule-heading">
      <div className="ev-container-schedule">
        <p className="ev-sec-kicker" data-reveal>
          The Programme
        </p>
        <h2 id="ev-schedule-heading" className="ev-schedule-title" data-reveal>
          Event Schedule
        </h2>
        <div className="ev-rule" data-reveal aria-hidden />
      </div>

      {/* ---- Cultural Events ---- */}
      <div className="ev-cat" id="cultural-events">
        <div className="ev-cat-head" data-reveal>
          <span className="ev-cat-icon" aria-hidden>
            <Star size={18} strokeWidth={1.6} />
          </span>
          <div>
            <h3 className="ev-cat-title">Cultural Events</h3>
            <p className="ev-cat-range">15 → 21 October 2026</p>
          </div>
        </div>

        <EventCarousel labels={CULTURAL_EVENTS.map((e) => e.title)}>
          {CULTURAL_EVENTS.map((event) => (
            <EventCard
              key={event.key}
              event={event}
              onOpen={() => setActive(event)}
            />
          ))}
        </EventCarousel>

        <div className="ev-culture-note" data-reveal>
          <strong>{CULTURAL_HIGHLIGHT.text}</strong>
          <span>{CULTURAL_HIGHLIGHT.range} · {CULTURAL_HIGHLIGHT.tagline}</span>
        </div>

        <div className="ev-amenities" data-reveal>
          {AMENITIES.map((a) => (
            <div key={a} className="ev-amenity">
              <span className="ev-amenity-dot" aria-hidden />
              <span>{a.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Religious Events ---- */}
      <div className="ev-cat" id="religious-events">
        <div className="ev-cat-head" data-reveal>
          <span className="ev-cat-icon" aria-hidden>
            <Calendar size={18} strokeWidth={1.6} />
          </span>
          <div>
            <h3 className="ev-cat-title">Religious Events</h3>
            <p className="ev-cat-range">16 → 21 October 2026</p>
          </div>
        </div>

        <EventCarousel labels={RELIGIOUS_EVENTS.map((e) => e.title)}>
          {RELIGIOUS_EVENTS.map((event) => (
            <EventCard
              key={event.key}
              event={event}
              onOpen={() => setActive(event)}
            />
          ))}
        </EventCarousel>

        <div className="ev-rituals" id="important-rituals">
          <p className="ev-sec-kicker" data-reveal>
            Important Rituals
          </p>
          <div className="ev-rituals-grid">
            {RITUALS.map((ritual) => (
              <div
                key={ritual.key}
                data-reveal
                className={`ev-ritual ${ritual.emphasis ? "ev-ritual--emphasis" : ""}`}
              >
                <h4 className="ev-ritual-title">{ritual.title}</h4>
                <p className="ev-ritual-body">{ritual.body}</p>
                {ritual.meta && <p className="ev-ritual-meta">{ritual.meta}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <EventModal event={active} onClose={() => setActive(null)} />
    </section>
  );
}
