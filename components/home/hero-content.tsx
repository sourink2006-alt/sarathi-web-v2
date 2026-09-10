"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const COUNTDOWN_TARGET = new Date("2026-10-16T10:00:00+05:30");
export const COMPLETION_MESSAGE = "Happy Durga Puja!";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};

function getTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
  }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    finished: false,
  };
}

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

function TimeCard({
  value,
  label,
  animate,
}: {
  value: number;
  label: string;
  animate: boolean;
}) {
  const text = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-cream/10 bg-[#16110c]/92 px-1 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] md:bg-cream/[0.06] md:backdrop-blur-md sm:gap-2 sm:py-4">
      {animate ? (
        <motion.span
          key={text}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="font-accent text-3xl leading-none tabular-nums text-warm-white sm:text-5xl"
        >
          {text}
        </motion.span>
      ) : (
        <span className="font-accent text-3xl leading-none tabular-nums text-warm-white sm:text-5xl">
          {text}
        </span>
      )}
      <span className="font-body text-[9px] uppercase tracking-[0.25em] text-gold sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function HeroContent() {
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    finished: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startTimer = () => {
      setTimeLeft(getTimeLeft(COUNTDOWN_TARGET));
      if (!intervalId) {
        intervalId = setInterval(() => {
          setTimeLeft(getTimeLeft(COUNTDOWN_TARGET));
        }, 1000);
      }
    };

    const stopTimer = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
            startTimer();
          } else {
            stopTimer();
          }
        },
        { threshold: 0 }
      );

      observer.observe(el);

      return () => {
        stopTimer();
        observer.disconnect();
      };
    } else {
      startTimer();
      return () => stopTimer();
    }
  }, []);

  // Desktop-only Hero text animation — never initialize on mobile
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const textBlock = textRef.current;
    if (!textBlock) return;

    const tween = gsap.fromTo(
      textBlock,
      { y: 0 },
      {
        y: -120,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: ".parallax__header",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  // Desktop-only countdown cards spread animation — never initialize on mobile
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const cards = gridRef.current?.children;
    if (!cards || cards.length !== 4) return;

    const desktopOffsets = [-120, -60, 60, 120];

    const tween = gsap.fromTo(
      cards,
      { x: 0 },
      {
        x: (index) => desktopOffsets[index],
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: ".parallax__header",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex w-full max-w-3xl flex-col items-center gap-4 px-4 text-center sm:gap-6"
    >
      <div
        ref={textRef}
        className="flex w-full flex-col items-center gap-3 sm:gap-4"
      >
        <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold sm:text-sm">
          Celebrating Bengali Heritage in Bengaluru
        </p>
        <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] text-warm-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)]">
          Sarathi Cultural Association
        </h2>
        <p className="max-w-xl font-body text-sm leading-relaxed text-sand sm:text-base">
          Join us in honoring our rich cultural traditions. From the grandeur
          of Durga Puja to community gatherings, Sarathi brings the warmth of
          Bengali culture alive in the Garden City.
        </p>
      </div>
      {timeLeft.finished ? (
        <p className="font-accent mt-2 text-3xl uppercase tracking-[0.15em] text-gold sm:text-5xl">
          {COMPLETION_MESSAGE}
        </p>
      ) : (
        <div
          ref={gridRef}
          className="mt-2 grid w-full max-w-xl grid-cols-4 gap-2 sm:gap-4"
          aria-label="Time remaining until Durga Puja 2026"
        >
          <TimeCard value={timeLeft.days} label="Days" animate={!isMobile} />
          <TimeCard value={timeLeft.hours} label="Hours" animate={!isMobile} />
          <TimeCard value={timeLeft.minutes} label="Mins" animate={!isMobile} />
          <TimeCard value={timeLeft.seconds} label="Secs" animate={!isMobile} />
        </div>
      )}
    </div>
  );
}
