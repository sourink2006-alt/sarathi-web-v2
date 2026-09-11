"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AboutExperience } from "@/components/about/about-experience";
import { AboutNav } from "@/components/about/about-nav";

function subscribeToMobile(callback: () => void) {
  const mql = window.matchMedia("(max-width: 767px)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getMobileServerSnapshot() {
  return false;
}

export default function AboutPage() {
  const router = useRouter();
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

  useEffect(() => {
    if (isMobile) {
      router.replace("/");
    }
  }, [isMobile, router]);

  if (isMobile) {
    return null;
  }

  return (
    <>
      <main className="relative w-full">
        <AboutExperience />
      </main>
      <AboutNav />
    </>
  );
}
