import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenisInstance: Lenis | null = null;
let refCount = 0;
let tickerFn: ((time: number) => void) | null = null;

export function initSharedLenis(): Lenis | null {
  if (typeof window === "undefined") return null;

  // Preserve native touch scrolling on mobile — do not hijack scroll
  if (window.matchMedia("(max-width: 767px)").matches) {
    return null;
  }

  refCount++;
  if (!lenisInstance) {
    lenisInstance = new Lenis();
    lenisInstance.on("scroll", ScrollTrigger.update);
    tickerFn = (time: number) => {
      lenisInstance?.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);
  }
  return lenisInstance;
}

export function destroySharedLenis() {
  if (refCount <= 0) return;
  refCount--;
  if (refCount <= 0 && lenisInstance) {
    if (tickerFn) {
      gsap.ticker.remove(tickerFn);
      tickerFn = null;
    }
    lenisInstance.destroy();
    lenisInstance = null;
    refCount = 0;
  }
}

export function getSharedLenis(): Lenis | null {
  return lenisInstance;
}

export function scrollToLenis(selector: string | number, offset = 0) {
  if (typeof window === "undefined") return false;
  if (!lenisInstance) {
    // Native smooth scroll fallback when Lenis is inactive on mobile
    if (typeof selector === "string") {
      const el = document.querySelector(selector);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: "smooth" });
        return true;
      }
    } else if (typeof selector === "number") {
      window.scrollTo({ top: selector + offset, behavior: "smooth" });
      return true;
    }
    return false;
  }
  lenisInstance.scrollTo(selector, { offset });
  return true;
}
