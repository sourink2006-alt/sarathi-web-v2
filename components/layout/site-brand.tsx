"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
];

/*
 * Compact fixed top navigation — logo + wordmark left, inline
 * route links right, decorative emblem far right. Links hidden on
 * small screens where the bottom dock remains the primary nav.
 */
export function SiteBrand() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sc-nav">
      <Link
        href="/"
        className="sc-nav-brand"
        aria-label="Sarathi Cultural Association — Home"
      >
        <img
          src="/logo.png"
          alt="Sarathi Cultural Association logo"
          width={80}
          height={80}
          className="sc-nav-logo"
        />
        <span className="sc-nav-word" aria-hidden="true">
          <span className="sc-nav-title">Sarathi</span>
          <span className="sc-nav-sub">Cultural Association</span>
        </span>
      </Link>

      <nav className="sc-nav-links" aria-label="Primary">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className={`sc-nav-link ${isActive(link.href) ? "sc-nav-link--active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <img
        src="/name.png"
        alt=""
        aria-hidden
        width={305}
        height={247}
        className="sc-nav-emblem"
      />
    </header>
  );
}