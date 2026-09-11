import type { Metadata } from "next";
import { AboutExperience } from "@/components/about/about-experience";
import { AboutNav } from "@/components/about/about-nav";

export const metadata: Metadata = {
  title: "About | Sarathi Cultural Association",
  description:
    "The story and heritage of Sarathi Cultural Association, celebrating Durga Puja and Bengali culture in Bangalore since 2003.",
};

export default function AboutPage() {
  return (
    <>
      <main className="relative w-full">
        <AboutExperience />
      </main>
      <AboutNav />
    </>
  );
}

