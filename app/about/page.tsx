import type { Metadata } from "next";
import { AboutExperience } from "@/components/about/about-experience";
import { AboutNav } from "@/components/about/about-nav";

export const metadata: Metadata = {
  title: "About | Sarathi Cultural Association",
  description:
    "The story of SCA — from Kolkata to Bengaluru. Every Bengali carries two homes.",
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
