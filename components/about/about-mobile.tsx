import React from "react";
import { CHAPTERS, CLOSING_LINE } from "./story-data";

export function AboutMobileExperience() {
  return (
    <section
      className="relative w-full bg-[#0a0806] px-4 py-16 text-[#efe4c8] sm:px-6 overflow-hidden"
      aria-label="The story of Sarathi Cultural Association"
    >
      {/* Background ambient gradient — pure CSS, no layout impact */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201, 165, 74, 0.12), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(180, 0, 35, 0.1), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-xl">
        {/* Editorial Section Header */}
        <header className="mb-12 text-center">
          <p className="font-accent text-[11px] uppercase tracking-[0.35em] text-gold">
            The Sarathi Archive · ইতিহাস ও ঐতিহ্য
          </p>
          <h2 className="font-display mt-2.5 text-3xl font-semibold leading-tight text-warm-white sm:text-4xl">
            Every Bengali Carries Two Homes
          </h2>
          <p className="font-body mx-auto mt-3 max-w-md text-xs leading-relaxed text-sand/80 sm:text-sm">
            The story of SCA — from the lanes of Kolkata to the gardens of
            Bengaluru. Connecting community, culture, and celebration since 2003.
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        </header>

        {/* Narrative Vertical Timeline */}
        <div className="relative ml-2 space-y-8 border-l border-gold/25 pl-5 sm:ml-4 sm:pl-7">
          {CHAPTERS.map((chapter) => (
            <article
              key={chapter.id}
              className="relative rounded-xl border border-gold/20 bg-[#140f0c]/95 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            >
              {/* Timeline marker node */}
              <span
                className="absolute -left-[27px] top-6 h-3 w-3 rounded-full border-2 border-night bg-gold shadow-[0_0_8px_rgba(201,165,74,0.6)] sm:-left-[35px]"
                aria-hidden="true"
              />

              {/* Bengali script watermark */}
              <span
                className="pointer-events-none absolute right-3 top-2 select-none font-serif text-4xl text-gold/[0.08]"
                aria-hidden="true"
              >
                {chapter.titleBn}
              </span>

              {/* Chapter Eyebrow & Index */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold text-gold/80 sm:text-xs">
                  {chapter.index}
                </span>
                <span className="h-1 w-1 rounded-full bg-gold/50" />
                <p className="font-accent text-[10px] uppercase tracking-[0.2em] text-gold sm:text-xs">
                  {chapter.eyebrow}
                </p>
              </div>

              {/* Chapter Title */}
              <h3 className="font-display mt-1 text-xl font-medium text-warm-white sm:text-2xl">
                {chapter.titleEn}
              </h3>

              {/* Story Body */}
              <p className="font-body mt-2.5 text-xs leading-relaxed text-sand sm:text-sm">
                {chapter.body}
              </p>

              {/* Integrated Memory Artifacts */}
              {chapter.id === "kolkata" && (
                <div className="mt-4 inline-flex items-center gap-2 rounded border border-gold/25 bg-[#221a14] px-3 py-1.5 font-mono text-[11px] text-[#e8dac1]">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
                  Calcutta Tramways · Route 36 · One Fare
                </div>
              )}

              {chapter.id === "memory" && (
                <div className="mt-4 block rounded border border-gold/25 bg-[#221a14] px-3 py-1.5 text-xs font-serif italic text-gold">
                  &ldquo;ঘর থেকে দূরে, ঘরের মতো&rdquo;
                </div>
              )}

              {chapter.id === "journey" && (
                <div className="mt-4 inline-flex items-center gap-2 rounded border border-gold/25 bg-[#221a14] px-3 py-1.5 font-mono text-[11px] text-[#e8dac1]">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
                  Kolkata → Bengaluru · One Way · 450 km
                </div>
              )}

              {chapter.id === "bengaluru" && (
                <div className="mt-4 w-fit overflow-hidden rounded-lg border border-gold/20 bg-[#221a14] p-2">
                  <svg
                    className="h-auto w-36 sm:w-44"
                    viewBox="0 0 170 74"
                    role="img"
                    aria-label="Silhouette of Howrah Bridge over the Hooghly"
                  >
                    <rect width="170" height="74" fill="#2d241c" />
                    <path
                      d="M0 60 H170 M10 60 V30 M160 60 V30 M20 34 Q85 -6 150 34 M32 40 H138 M38 46 H132 M45 52 H125 M52 58 H118"
                      stroke="#efe4c8"
                      strokeWidth="2.5"
                      fill="none"
                    />
                  </svg>
                  <p className="font-mono mt-1 text-center text-[9px] uppercase tracking-wider text-sand/70">
                    Howrah Bridge Silhouette
                  </p>
                </div>
              )}

              {chapter.id === "puja" && (
                <div className="mt-4 inline-flex items-center gap-2 rounded border border-[#b40023]/40 bg-[#291014] px-3 py-1.5 text-xs text-[#f5c6cb]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e84c60]" />
                  দুর্গা পূজা — আমন্ত্রণ · ষষ্ঠী থেকে দশমী
                </div>
              )}

              {chapter.id === "sca" && (
                <div className="mt-4 rounded-lg border border-gold/30 bg-[#221a14] p-3 text-xs text-[#efe4c8]">
                  <p className="font-accent font-semibold text-gold">
                    Sarathi Cultural Association
                  </p>
                  <p className="font-body text-[11px] text-sand/80">
                    Member · Est. 2003 · Bengaluru
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Closing Line */}
        <footer className="mt-14 border-t border-gold/25 pt-10 text-center">
          <p className="font-serif text-lg italic text-warm-white sm:text-xl">
            &ldquo;{CLOSING_LINE}&rdquo;
          </p>
          <p className="font-accent mt-3 text-[10px] uppercase tracking-[0.25em] text-gold">
            Sarathi Cultural Association · Bengaluru
          </p>
        </footer>
      </div>
    </section>
  );
}
