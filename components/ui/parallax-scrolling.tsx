"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initSharedLenis, destroySharedLenis } from "@/lib/lenis";
import { HeroContent } from "@/components/home/hero-content";

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).ScrollTrigger = ScrollTrigger;
    }

    initSharedLenis();

    return () => {
      destroySharedLenis();
    };
  }, []);

  return (
    <div className="parallax" ref={parallaxRef}>
      <section className="parallax__header">
        <div className="parallax__visuals">
          <div className="parallax__layers">
            <picture className="parallax__layer-picture" data-parallax-layer="1">
              <source media="(max-width: 767px)" srcSet="/images/hero-bg.jpg" />
              <source media="(min-width: 768px)" srcSet="/images/hero-bg-1920.jpg" />
              <img
                src="/images/hero-bg-1920.jpg"
                loading="eager"
                width={1920}
                height={1048}
                data-parallax-layer="1"
                alt="Durga Puja celebration banner"
                className="parallax__layer-img"
              />
            </picture>
            <div className="parallax__overlay"></div>
            <div className="parallax__layer-title">
              <HeroContent />
            </div>
          </div>
          <div className="parallax__fade"></div>
        </div>
      </section>
    </div>
  );
}
