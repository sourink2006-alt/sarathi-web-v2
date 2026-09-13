import { ParallaxComponent } from "@/components/ui/parallax-scrolling";
import { AboutExperience } from "@/components/about/about-experience";
import { EventsPage } from "@/components/events/events-page";
import { BookingPage } from "@/components/booking/booking-page";
import { VenueSection } from "@/components/venue/venue-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { Navbar } from "@/components/layout/navbar";

/*
 * The whole experience is ONE continuous root document. The four former
 * routes are now sibling sections scrolled by the single browser scrollbar:
 *
 *   #home → #about (pinned cinematic) → #events → #booking
 *
 * Dock navigation smooth-scrolls between these ids instead of loading
 * routes. The old routes (/about, /events, /booking) redirect to /#section.
 *
 * SECTION ORDER — ALWAYS LAST:
 * "Where We Gather" (VenueSection) is the GLOBAL FINAL section. It renders
 * after the entire Booking experience, immediately before the site footer.
 * ANY future section (Gallery, Sponsors, Contact, Committee, Donations, …)
 * must be inserted ABOVE this section — never below it. Keep the order:
 *
 *   HOME → ABOUT → EVENTS → BOOKING → [future sections] →
 *   WHERE WE GATHER (always last major section) → FOOTER / end
 *
 * The bottom dock intentionally keeps 4 items (Home/About/Events/Booking);
 * the gather section is informational and is NOT a navigation destination.
 */
export default function Home() {
  return (
    <>
      <main className="relative w-full">
        <section id="home" data-section="home">
          <ParallaxComponent />
        </section>

        <section id="about" data-section="about">
          <AboutExperience />
        </section>

        <section id="events" data-section="events">
          <EventsPage />
        </section>

        <section id="booking" data-section="booking">
          <BookingPage />
        </section>

        {/* ==== GLOBAL FINAL SECTION — DO NOT place anything after this ==== */}
        <section id="gather" data-section="gather" aria-label="Where we gather">
          <VenueSection />
        </section>

        <SiteFooter />
      </main>
      <Navbar />
    </>
  );
}