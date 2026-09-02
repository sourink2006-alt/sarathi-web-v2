import { ParallaxComponent } from "@/components/ui/parallax-scrolling";
import { AboutExperience } from "@/components/about/about-experience";
import { EventsPage } from "@/components/events/events-page";
import { BookingPage } from "@/components/booking/booking-page";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative w-full">
        <div data-section="home">
          <ParallaxComponent />
        </div>
        <div data-section="about">
          <AboutExperience />
        </div>
        <div data-section="events">
          <EventsPage />
        </div>
        <div data-section="booking">
          <BookingPage />
        </div>
      </main>
    </>
  );
}
