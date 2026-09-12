import { ParallaxComponent } from "@/components/ui/parallax-scrolling";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative w-full">
        <ParallaxComponent />
      </main>
    </>
  );
}

