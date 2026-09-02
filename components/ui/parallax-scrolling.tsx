"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initSharedLenis, destroySharedLenis } from "@/lib/lenis";
import { HeroContent } from "@/components/home/hero-content";

const LAYER_IMAGES = [
  {
    layer: "1",
    src: "/images/hero-bg-1920.jpg",
    alt: "Durga Puja celebration banner",
  },
];

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
            {LAYER_IMAGES.map((img) => (
              <img
                key={img.layer}
                src={img.src}
                loading="eager"
                width={1920}
                height={1048}
                data-parallax-layer={img.layer}
                alt={img.alt}
                className="parallax__layer-img"
              />
            ))}
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
