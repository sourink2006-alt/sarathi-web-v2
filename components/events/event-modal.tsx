"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { EventItem } from "./events-data";

/*
 * In-page detail view for an event, opened by clicking its poster/card.
 * Uses motion/AnimatePresence (already a dependency) with an overlay +
 * Escape/close-button dismissal and basic focus management.
 */
export function EventModal({
  event,
  onClose,
}: {
  event: EventItem | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!event) return;
    closeRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="ev-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={event.title}
            className="ev-modal-card"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <button
              ref={closeRef}
              type="button"
              className="ev-modal-close"
              onClick={onClose}
              aria-label="Close details"
            >
              <X size={20} strokeWidth={1.75} />
            </button>

            <span className={`ev-modal-cat ev-modal-cat--${event.category}`}>
              {event.categoryLabel}
            </span>
            <p className="ev-modal-date">{event.date}</p>
            <h2 className="ev-modal-title">{event.title}</h2>

            <div className="ev-modal-rule" aria-hidden />

            <div className="ev-modal-body">
              {event.details.map((block, i) => (
                <div key={i} className="ev-modal-block">
                  {block.heading && (
                    <h3 className="ev-modal-head">{block.heading}</h3>
                  )}
                  {block.lines.map((line) => (
                    <p key={line} className="ev-modal-line">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
