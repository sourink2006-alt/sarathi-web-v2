import type { EventItem } from "./events-data";

/*
 * BookMyShow-inspired event card: a LARGE empty poster placeholder in the
 * correct 1080:1350 (4:5 portrait) ratio with a small amount of event info
 * below. Details are intentionally kept off the card — they open in the modal.
 * Real posters will replace the placeholder later.
 */
export function EventCard({
  event,
  onOpen,
}: {
  event: EventItem;
  onOpen: () => void;
}) {
  return (
    <article className="ev-card" data-reveal>
      <button
        type="button"
        className="ev-card-poster"
        onClick={onOpen}
        aria-label={`Open details for ${event.title}`}
      >
        <span className="ev-card-poster-grain" aria-hidden />
        <span className="ev-card-poster-label" aria-hidden>
          Poster
        </span>
        <span className="ev-card-poster-cat">{event.categoryLabel}</span>
      </button>

      <div className="ev-card-info">
        <p className="ev-card-date">{event.date}</p>
        <h3 className="ev-card-title">{event.title}</h3>
        <p className="ev-card-summary">{event.summary}</p>
        <button type="button" className="ev-card-open" onClick={onOpen}>
          View details
          <span aria-hidden>→</span>
        </button>
      </div>
    </article>
  );
}
