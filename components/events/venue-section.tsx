import { VENUE } from "./events-data";

/*
 * Venue — Where We Gather. No map/directions CTA is rendered because no
 * verified location URL exists in the project — an address block stands in
 * its place. The puja note explains the festival runs at this site.
 */
export function VenueSection() {
  return (
    <section className="ev-venue" aria-labelledby="ev-venue-heading">
      <h2 id="ev-venue-heading" className="ev-kicker" data-reveal>
        Where We Gather
      </h2>

      <div className="ev-venue-address" data-reveal>
        <strong>{VENUE.association}</strong>
        <strong>{VENUE.ground}</strong>
        <span>{VENUE.block}</span>
        <span>{VENUE.area}</span>
        <span>{VENUE.city}</span>
      </div>

      <div className="ev-rule" style={{ marginInline: "auto" }} data-reveal aria-hidden />

      <p className="ev-venue-note" data-reveal>
        All Puja events are held at this site from October 16 to 21, 2026.
      </p>
    </section>
  );
}