"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  HandPlatter,
  Store,
  UploadCloud,
  Check,
  Wallet,
  X,
  ArrowLeft,
  ClipboardList,
  Users,
  CalendarDays,
  BadgeCheck,
  Landmark,
  Armchair,
  TriangleAlert,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getSharedLenis } from "@/lib/lenis";
import {
  PRASAD_ITEMS,
  MEMBERSHIP_PLANS,
  MEMBERSHIP_FORM,
  GENDERS,
  MEMBERSHIP_TYPES,
  STALL_TYPES,
  STALL_INFO,
  DANDIYA_NIGHT,
  type PrasadItem,
} from "./booking-data";
import "./booking.css";

type Err = Record<string, string | undefined>;

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={error ? "bk-field bk-field--invalid" : "bk-field"}>
      <label>
        {label}
        {required ? <span className="bk-required"> *</span> : null}
      </label>
      {children}
      {error ? <span className="bk-err">{error}</span> : null}
    </div>
  );
}

/*
 * Centered modal overlay. Dims the page behind it, stays in place, and closes
 * on the X button, on Escape, or when the backdrop is clicked.
 * `open` switches between mounted and unmounted (so AnimatePresence can
 * fade/scale the card in and out).
 */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(
    () => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", onKey);

      // Lock the background page completely. The page scrolls via Lenis (smooth
      // scroll), so overflow:hidden alone is not enough — stop Lenis too so
      // wheel/trackpad events scroll the modal, not the page behind it.
      const lenis = getSharedLenis();
      const root = document.documentElement;
      const prevBody = document.body.style.overflow;
      const prevHtml = root.style.overflow;
      document.body.style.overflow = "hidden";
      root.style.overflow = "hidden";
      lenis?.stop();

      // Native (non-passive) wheel handler on the panel: Lenis keeps a wheel
      // listener calling preventDefault even after stop(), which would block the
      // panel's own overflow scroll. So we scroll the panel manually here.
      const panel = panelRef.current;
      const onWheel = (e: WheelEvent) => {
        if (!panel) return;
        if (panel.scrollHeight <= panel.clientHeight) return;
        e.preventDefault();
        panel.scrollTop += e.deltaY;
      };
      panel?.addEventListener("wheel", onWheel, { passive: false });

      return () => {
        document.removeEventListener("keydown", onKey);
        panel?.removeEventListener("wheel", onWheel);
        document.body.style.overflow = prevBody;
        root.style.overflow = prevHtml;
        lenis?.start();
      };
    },
    [open, onClose],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="bk-modal"
          className="bk-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            className="bk-modal-panel"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bk-modal-head">
              {title ? <div className="bk-modal-title">{title}</div> : null}
              <button
                type="button"
                className="bk-icon-btn"
                aria-label="Close"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
            <div className="bk-modal-body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const BOOKING_ANCHORS = [
  { id: "bk-prasad", label: "Prasad Booking" },
  { id: "bk-stall", label: "Stall Application" },
  { id: "bk-membership", label: "Membership" },
  { id: "bk-dandiya", label: "Dandiya Night" },
] as const;

const BOOKING_EASING = (t: number) => 1 - Math.pow(1 - t, 4);

function scrollToBooking(id: string) {
  const lenis = getSharedLenis();
  if (lenis) {
    lenis.scrollTo(`#${id}`, { duration: 0.9, easing: BOOKING_EASING, force: true });
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function BookingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  /* ---- prasad ---- */
  const [prasad, setPrasad] = useState<PrasadItem | null>(null);
  const [qty, setQty] = useState(1);
  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [shotName, setShotName] = useState("");
  const [shotErr, setShotErr] = useState("");
  const [pErr, setPErr] = useState<Err>({});
  const [pDone, setPDone] = useState(false);

  /* ---- membership ---- */
  const [memberKey, setMemberKey] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [mName, setMName] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mMobile, setMMobile] = useState("");
  const [mDob, setMDob] = useState("");
  const [mGender, setMGender] = useState("");
  const [mOcc, setMOcc] = useState("");
  const [mCo, setMCo] = useState("");
  const [mType, setMType] = useState("");
  const [mWhy, setMWhy] = useState("");
  const [mSig, setMSig] = useState("");
  const [mDeclare, setMDeclare] = useState(false);
  const [mErr, setMErr] = useState<Err>({});
  const [mDone, setMDone] = useState(false);

  /* ---- stall ---- */
  const [sName, setSName] = useState("");
  const [sBus, setSBus] = useState("");
  const [sPhone, setSPhone] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sType, setSType] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sErr, setSErr] = useState<Err>({});
  const [sDone, setSDone] = useState(false);

  /* ---- dandiya tickets ---- */
  const [dandiyaOpen, setDandiyaOpen] = useState(false);
  const [dStep, setDStep] = useState(1);
  const [dQty, setDQty] = useState(1);
  const [dName, setDName] = useState("");
  const [dMobile, setDMobile] = useState("");
  const [dEmail, setDEmail] = useState("");
  const [dErr, setDErr] = useState<Err>({});

  const closeDandiya = useCallback(() => {
    setDandiyaOpen(false);
    setDStep(1);
    setDQty(1);
    setDName("");
    setDMobile("");
    setDEmail("");
    setDErr({});
  }, []);

  const nextDandiya = () => {
    if (dStep === 2) {
      const err: Err = {};
      if (!dName.trim()) err.name = "Full name is required.";
      if (!/^[0-9+\-\s]{7,15}$/.test(dMobile.trim()))
        err.mobile = "Enter a valid mobile number.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dEmail.trim()))
        err.email = "Enter a valid email address.";
      setDErr(err);
      if (Object.keys(err).length) return;
    }
    setDErr({});
    setDStep((s) => Math.min(s + 1, 4));
  };

  const dPrice = DANDIYA_NIGHT.ticketPrice;
  const dTotal =
    dPrice === null ? null : dPrice * dQty;
  const dMax = DANDIYA_NIGHT.maxTicketsPerBooking;

  const selectedPlan =
    (memberKey && MEMBERSHIP_PLANS.find((p) => p.key === memberKey)) || null;

  const chooseMeal = (item: PrasadItem) => {
    setPrasad(item);
    setPDone(false);
    setPErr({});
  };

  const closePrasad = useCallback(() => {
    setPrasad(null);
  }, []);

  const closeMembership = useCallback(() => {
    setMemberKey(null);
    setApplyOpen(false);
  }, []);

  const onUpload = (file: File | undefined) => {
    setShotErr("");
    if (!file) {
      setShotName("");
      return;
    }
    const okType =
      /^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!okType) {
      setShotErr("Only JPG or PNG images are accepted.");
      setShotName("");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setShotErr("File must be 5MB or smaller.");
      setShotName("");
      return;
    }
    setShotName(file.name);
  };

  const submitPrasad = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Err = {};
    if (!pName.trim()) err.name = "Full name is required.";
    if (!/^[0-9+\-\s]{7,15}$/.test(pPhone.trim()))
      err.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pEmail.trim()))
      err.email = "Enter a valid email address.";
    if (!qty || qty < 1) err.qty = "Quantity must be at least 1.";
    if (!shotName) err.shot = shotErr || "Payment screenshot is required.";
    setPErr(err);
    if (Object.keys(err).length) return;
    setPDone(true);
  };

  const openPlan = (key: string) => {
    setMemberKey(key);
    setApplyOpen(false);
    setMDone(false);
    setMErr({});
  };

  const submitMembership = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Err = {};
    if (!mName.trim()) err.name = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mEmail.trim()))
      err.email = "Enter a valid email address.";
    if (!/^[0-9+\-\s]{7,15}$/.test(mMobile.trim()))
      err.mobile = "Enter a valid mobile number.";
    if (!mDob) err.dob = "Date of birth is required.";
    if (!mGender) err.gender = "Please select a gender.";
    if (!mType) err.type = "Please select a membership type.";
    if (!mWhy.trim()) err.why = "Please tell us why you would like to join.";
    if (!mSig.trim()) err.sig = "Digital signature is required.";
    if (!mDeclare) err.declare = "You must accept the declaration.";
    setMErr(err);
    if (Object.keys(err).length) return;
    setMDone(true);
  };

  const submitStall = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Err = {};
    if (!sName.trim()) err.name = "Owner name is required.";
    if (!sBus.trim()) err.business = "Business name is required.";
    if (!/^[0-9+\-\s]{7,15}$/.test(sPhone.trim()))
      err.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail.trim()))
      err.email = "Enter a valid email address.";
    if (!sType) err.type = "Please select a stall type.";
    if (!sDesc.trim()) err.desc = "Description is required.";
    setSErr(err);
    if (Object.keys(err).length) return;
    setSDone(true);
  };

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ctx: gsap.Context | undefined;
    if (!reduced) {
      ctx = gsap.context(
        () => {
          root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
            gsap.fromTo(
              el,
              { y: 26, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 90%", once: true },
              },
            );
          });
        },
        root,
      );
    }
    return () => {
      ctx?.revert();
    };
  }, []);

  const total = prasad ? prasad.price * qty : 0;

  return (
    <div ref={rootRef} className="bk">
      <header className="bk-header sc-container" data-reveal>
        <span className="sc-label">Sarathi Cultural Association</span>
        <h1>Booking</h1>
        <div className="sc-rule" style={{ marginInline: "auto" }} />
        <p className="sc-lede" style={{ marginInline: "auto" }}>
          Prasad, membership, and stalls for Durga Puja 2026 — all in one place.
        </p>
      </header>

      {/* ================= QUICK ACCESS ================= */}
      <nav className="bk-quick" aria-label="Booking sections">
        <div className="bk-quick-scroll">
          {BOOKING_ANCHORS.map((a) => (
            <button
              key={a.id}
              type="button"
              className="bk-quick-item"
              onClick={() => scrollToBooking(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ================= PRASAD ================= */}
      <section id="bk-prasad" className="sc-section sc-container" data-reveal>
        <div className="bk-cat-head">
          <span className="bk-cat-icon">
            <HandPlatter size={18} />
          </span>
          <div>
            <div className="bk-cat-title">Prasad Booking</div>
            <div className="bk-cat-sub">
              Book sacred prasad offerings for Durga Puja. Pickup only — no delivery.
            </div>
          </div>
        </div>

        <div className="bk-steps" aria-label="Prasad booking steps">
          <span className={prasad ? "bk-step bk-step--done" : "bk-step bk-step--on"}>
            <b>1</b> Choose Meal
          </span>
          <span className={prasad ? "bk-step bk-step--on" : "bk-step"}>
            <b>2</b> Payment &amp; Details
          </span>
          <span className={prasad && pDone ? "bk-step" : "bk-step"}>
            <b>3</b> Submit
          </span>
        </div>

        <div className="bk-how">
          <b>How it works:</b> Select a prasad → Pay via UPI (scan QR below) →
          Upload payment screenshot → Our team verifies &amp; confirms your booking.
        </div>

        {/* Step 1 — choose meal */}
        <div className="bk-prasad-grid" role="radiogroup" aria-label="Choose a prasad">
          {PRASAD_ITEMS.map((item) => {
            const sel = prasad?.key === item.key;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={sel}
                key={item.key}
                className={sel ? "bk-prasad bk-prasad--selected" : "bk-prasad"}
                onClick={() => chooseMeal(item)}
              >
                <div className="bk-prasad-top">
                  <span className="bk-prasad-name">{item.name}</span>
                  <span className="bk-prasad-dot" aria-hidden />
                </div>
                <p className="bk-prasad-desc">{item.description}</p>
                <div className="bk-prasad-price">₹{item.price}</div>
              </button>
            );
          })}
        </div>

      </section>

      {/* ================= MEMBERSHIP ================= */}
      <section id="bk-membership" className="sc-section sc-container" data-reveal>
        <div className="bk-cat-head">
          <span className="bk-cat-icon">
            <Wallet size={18} />
          </span>
          <div>
            <div className="bk-cat-title">Festival / Event Access Plans</div>
            <div className="bk-cat-sub">
              Choose the access that fits — Anjali, bhog coupons, and seating for
              our Durga Puja evenings.
            </div>
          </div>
        </div>

        <div className="bk-steps" aria-label="Membership steps">
          <span className="bk-step bk-step--on">
            <b>1</b> Choose Plan
          </span>
          <span className={selectedPlan && !applyOpen ? "bk-step bk-step--on" : "bk-step"}>
            <b>2</b> View Perks
          </span>
          <span className={applyOpen ? "bk-step bk-step--on" : "bk-step"}>
            <b>3</b> Apply
          </span>
        </div>

        <div className="bk-membership-grid">
          {MEMBERSHIP_PLANS.map((plan) => {
            const sel = memberKey === plan.key;
            return (
              <div
                key={plan.key}
                className={sel ? "bk-plan bk-plan--selected" : "bk-plan"}
              >
                <div className="bk-plan-name">{plan.name}</div>
                <div className="bk-plan-price">
                  ₹{plan.price.toLocaleString("en-IN")}
                  <small> / festival</small>
                </div>
                <ul className="bk-plan-benefits">
                  {plan.benefits.map((b, i) => (
                    <li key={i}>
                      <Check size={14} className="bk-check" />
                      {b}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={sel ? "sc-cta bk-plan-btn" : "sc-cta sc-cta--ghost bk-plan-btn"}
                  onClick={() => openPlan(plan.key)}
                >
                  {sel ? "View Selected Plan" : "SELECT / BOOK"}
                </button>
              </div>
            );
          })}
        </div>

      </section>

      {/* ================= STALL ================= */}
      <section id="bk-stall" className="sc-section sc-container" data-reveal>
        <div className="bk-cat-head">
          <span className="bk-cat-icon">
            <Store size={18} />
          </span>
          <div>
            <div className="bk-cat-title">Stall Application</div>
            <div className="bk-cat-sub">
              Set up a stall at our Durga Puja pandal — food, crafts, clothing, and
              more. No payment required to apply.
            </div>
          </div>
        </div>

        <div className="bk-steps" aria-label="Stall steps">
          <span className="bk-step bk-step--on">
            <b>1</b> Information
          </span>
          <span className="bk-step bk-step--on">
            <b>2</b> Application
          </span>
          <span className="bk-step">
            <b>3</b> Submit
          </span>
        </div>

        <div className="bk-stall-grid">
          {STALL_INFO.map((info) => (
            <div key={info.heading} className="bk-stall-card">
              <div className="bk-stall-head">
                <ClipboardList size={14} />
                {info.heading}
              </div>
              <div className="bk-stall-text">{info.text}</div>
            </div>
          ))}
        </div>

        <div className="bk-panel bk-panel--mt">
          <div className="bk-panel-head">Application Form</div>
          <form className="bk-form" onSubmit={submitStall} noValidate>
            <Field label="Owner Name" required error={sErr.name}>
              <input
                className="bk-input"
                value={sName}
                onChange={(e) => setSName(e.target.value)}
                placeholder="Your name"
              />
            </Field>
            <Field label="Business Name" required error={sErr.business}>
              <input
                className="bk-input"
                value={sBus}
                onChange={(e) => setSBus(e.target.value)}
                placeholder="Business / stall name"
              />
            </Field>
            <div className="bk-app-grid">
              <Field label="Phone" required error={sErr.phone}>
                <input
                  className="bk-input"
                  value={sPhone}
                  onChange={(e) => setSPhone(e.target.value)}
                  placeholder="Phone number"
                />
              </Field>
              <Field label="Email" required error={sErr.email}>
                <input
                  className="bk-input"
                  type="email"
                  value={sEmail}
                  onChange={(e) => setSEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
            </div>
            <Field label="Stall Type" required error={sErr.type}>
              <select
                className="bk-select"
                value={sType}
                onChange={(e) => setSType(e.target.value)}
              >
                <option value="" disabled>
                  Select stall type
                </option>
                {STALL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description" required error={sErr.desc}>
              <textarea
                className="bk-textarea"
                rows={4}
                value={sDesc}
                onChange={(e) => setSDesc(e.target.value)}
                placeholder="Describe your stall, products, and any setup needs"
              />
            </Field>
            <button className="sc-cta bk-submit" type="submit">
              Submit Application
            </button>
            <p className="bk-no-fee">
              No payment required to apply.
            </p>
            {sDone && !Object.keys(sErr).length ? (
              <div className="bk-success">
                Application received — our team will be in touch to discuss your
                stall.
              </div>
            ) : null}
          </form>
        </div>
      </section>

      {/* ================= DANDIYA NIGHT TICKETS ================= */}
      <section id="bk-dandiya" className="sc-section sc-container" data-reveal>
        <div className="bk-dandiya-feature">
          <div className="bk-dandiya-rings" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="bk-dandiya-copy">
            <p className="bk-dandiya-kicker">{DANDIYA_NIGHT.date}</p>
            <span className="bk-dandiya-rule" aria-hidden="true" />
            <div className="bk-dandiya-title">{DANDIYA_NIGHT.eventName}</div>
            <p className="bk-dandiya-sub">{DANDIYA_NIGHT.tagline}</p>
            <button
              type="button"
              className="sc-cta bk-dandiya-btn"
              onClick={() => setDandiyaOpen(true)}
            >
              Book Dandiya Tickets
            </button>
          </div>
        </div>
      </section>

      {/* ---------- PRASAD MODAL ---------- */}
      <Modal open={!!prasad} onClose={closePrasad} title="Scan & Pay via UPI">
        <div className="bk-panel-body">
          <div className="bk-pay">
            <div className="bk-pay-sub">Selected Prasad</div>
            <div className="bk-selected-meal">
              <span>{prasad?.name}</span>
              <small>₹{prasad?.price} each</small>
            </div>
            <div className="bk-qty-row">
              <span className="sc-meta">Quantity</span>
              <div className="bk-stepper">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <input
                  className="bk-input bk-qty-input"
                  type="number"
                  min={1}
                  aria-label="Quantity"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="bk-pay-total">
              <span>Amount Payable</span>
              <strong>₹{total}</strong>
            </div>
            <div className="bk-pay-sub" style={{ marginTop: 18 }}>
              Payment QR — placeholder
            </div>
            <div className="bk-qr">
              <span className="bk-qr-label">QR Code Here</span>
            </div>
            <p className="bk-upi">
              UPI ID: <b>sarathi@upi</b>
            </p>
          </div>

          <form className="bk-form" onSubmit={submitPrasad} noValidate>
            <div className="bk-form-title">Booking Details</div>
            <Field label="Selected Prasad" required>
              <input
                className="bk-input"
                value={prasad ? `${prasad.name} — ₹${prasad.price} × ${qty}` : ""}
                readOnly
              />
            </Field>
            <Field label="Full Name" required error={pErr.name}>
              <input
                className="bk-input"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="Your full name"
              />
            </Field>
            <Field label="Phone Number" required error={pErr.phone}>
              <input
                className="bk-input"
                value={pPhone}
                onChange={(e) => setPPhone(e.target.value)}
                placeholder="e.g. 98765 43210"
              />
            </Field>
            <Field label="Email" required error={pErr.email}>
              <input
                className="bk-input"
                type="email"
                value={pEmail}
                onChange={(e) => setPEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Payment Screenshot" required error={pErr.shot}>
              <label className="bk-upload">
                <UploadCloud size={22} color="currentColor" />
                {shotName ? (
                  <span className="bk-upload-file">{shotName}</span>
                ) : (
                  <span>
                    <b>Click to upload</b>
                    <br />
                    JPG/PNG, max 5MB
                  </span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  className="sr-only"
                  onChange={(e) => onUpload(e.target.files?.[0])}
                />
              </label>
            </Field>
            <button className="sc-cta bk-submit" type="submit">
              Submit Booking
            </button>
            {pDone && !Object.keys(pErr).length ? (
              <div className="bk-success">
                Booking request received — our team will verify your screenshot and
                confirm shortly.
              </div>
            ) : null}
          </form>
        </div>
      </Modal>

      {/* ---------- MEMBERSHIP MODAL ---------- */}
      <Modal
        open={!!selectedPlan}
        onClose={closeMembership}
        title={selectedPlan?.name}
      >
        {!applyOpen ? (
          <div className="bk-plan-detail">
            <div className="bk-plan-detail-hero">
              <div>
                <div className="bk-plan-detail-name">{selectedPlan?.name}</div>
                <div className="bk-plan-detail-meta">
                  {selectedPlan && (
                    <span className="bk-pill">
                      <Users size={13} /> {selectedPlan.detail.forWho}
                    </span>
                  )}
                  {selectedPlan && (
                    <span className="bk-pill">
                      <CalendarDays size={13} /> {selectedPlan.detail.duration}
                    </span>
                  )}
                </div>
              </div>
              <div className="bk-plan-detail-price">
                ₹{selectedPlan?.price.toLocaleString("en-IN")}
                <small> / festival</small>
              </div>
            </div>

            {selectedPlan && (
              <div className="bk-plan-detail-sections">
                <section className="bk-detail-sec">
                  <div className="bk-detail-sec-head">
                    <BadgeCheck size={17} className="bk-sec-ic" />
                    WHAT YOU GET
                  </div>
                  <ul className="bk-detail-list">
                    {selectedPlan.detail.whatYouGet.map((b, i) => (
                      <li key={i}>
                        <Check size={15} className="bk-check" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bk-detail-sec">
                  <div className="bk-detail-sec-head">
                    <Landmark size={17} className="bk-sec-ic" />
                    PUJA ACCESS
                  </div>
                  <ul className="bk-detail-list">
                    {selectedPlan.detail.pujaAccess.map((b, i) => (
                      <li key={i}>
                        <Landmark size={15} className="bk-check" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bk-detail-sec">
                  <div className="bk-detail-sec-head">
                    <Armchair size={17} className="bk-sec-ic" />
                    EVENT BENEFITS
                  </div>
                  {selectedPlan.detail.eventBenefits.length ? (
                    <ul className="bk-detail-list">
                      {selectedPlan.detail.eventBenefits.map((b, i) => (
                        <li key={i}>
                          <Armchair size={15} className="bk-check" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="bk-detail-none">
                      No reserved seating included with this plan.
                    </p>
                  )}
                </section>

                {selectedPlan.detail.limitations.length ? (
                  <section className="bk-detail-sec bk-detail-sec--warn">
                    <div className="bk-detail-sec-head">
                      <TriangleAlert size={17} className="bk-sec-ic bk-sec-ic--warn" />
                      IMPORTANT INFORMATION
                    </div>
                    <ul className="bk-detail-list">
                      {selectedPlan.detail.limitations.map((b, i) => (
                        <li key={i}>
                          <X size={15} className="bk-x" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <p className="bk-detail-review">
                  All membership applications are reviewed by the SCA
                  Management Committee. Fee payment and membership activation
                  happen only after your application is approved.
                </p>
              </div>
            )}

            <button
              type="button"
              className="sc-cta bk-submit"
              style={{ alignSelf: "flex-start" }}
              onClick={() => setApplyOpen(true)}
            >
              BOOK / APPLY FOR MEMBERSHIP
            </button>
          </div>
        ) : (
          <form className="bk-form bk-app" onSubmit={submitMembership} noValidate>
            <button
              type="button"
              className="bk-back"
              onClick={() => {
                setApplyOpen(false);
                setMErr({});
              }}
            >
              <ArrowLeft size={15} /> Back to plan details
            </button>

            <div className="bk-app-title">{MEMBERSHIP_FORM.introTitle}</div>
            <div className="bk-app-sub">{MEMBERSHIP_FORM.title}</div>
            <p className="bk-app-intro">{MEMBERSHIP_FORM.intro}</p>

            <div className="bk-app-head">Membership Process</div>
            <ol className="bk-app-process">
              {MEMBERSHIP_FORM.process.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <div className="bk-app-note">{MEMBERSHIP_FORM.note}</div>

            <div className="bk-app-head">Selected Plan</div>
            <div className="bk-selected-plan">
              {selectedPlan?.name} — ₹{selectedPlan?.price.toLocaleString("en-IN")}
            </div>

            <div className="bk-app-head">Your Details</div>
            <div className="bk-app-grid">
              <Field label="Full Name" required error={mErr.name}>
                <input
                  className="bk-input"
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  placeholder="Your full name"
                />
              </Field>
              <Field label="Email Address" required error={mErr.email}>
                <input
                  className="bk-input"
                  type="email"
                  value={mEmail}
                  onChange={(e) => setMEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
            </div>
            <div className="bk-app-grid">
              <Field label="Mobile Number" required error={mErr.mobile}>
                <input
                  className="bk-input"
                  value={mMobile}
                  onChange={(e) => setMMobile(e.target.value)}
                  placeholder="e.g. 98765 43210"
                />
              </Field>
              <Field label="Date of Birth" required error={mErr.dob}>
                <input
                  className="bk-input"
                  type="date"
                  value={mDob}
                  onChange={(e) => setMDob(e.target.value)}
                />
              </Field>
            </div>
            <div className="bk-app-grid">
              <Field label="Gender" required error={mErr.gender}>
                <select
                  className="bk-select"
                  value={mGender}
                  onChange={(e) => setMGender(e.target.value)}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Occupation">
                <input
                  className="bk-input"
                  value={mOcc}
                  onChange={(e) => setMOcc(e.target.value)}
                  placeholder="Your occupation (optional)"
                />
              </Field>
            </div>
            <div className="bk-app-grid">
              <Field label="Company / College">
                <input
                  className="bk-input"
                  value={mCo}
                  onChange={(e) => setMCo(e.target.value)}
                  placeholder="Company or college (optional)"
                />
              </Field>
              <Field label="Membership Type" required error={mErr.type}>
                <select
                  className="bk-select"
                  value={mType}
                  onChange={(e) => setMType(e.target.value)}
                >
                  <option value="" disabled>
                    Select membership type
                  </option>
                  {MEMBERSHIP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Why would you like to join SCA?" required error={mErr.why}>
              <textarea
                className="bk-textarea"
                rows={4}
                value={mWhy}
                onChange={(e) => setMWhy(e.target.value)}
                placeholder="Tell us a little about your connection to the community"
              />
            </Field>
            <Field label="Type your Full Name as Digital Signature" required error={mErr.sig}>
              <input
                className="bk-input"
                value={mSig}
                onChange={(e) => setMSig(e.target.value)}
                placeholder="e.g. Rahul Sharma"
              />
            </Field>

            <label className={mErr.declare ? "bk-declare bk-declare--invalid" : "bk-declare"}>
              <input
                type="checkbox"
                checked={mDeclare}
                onChange={(e) => setMDeclare(e.target.checked)}
              />
              <span>
                I declare that the information provided above is true and correct.
              </span>
            </label>
            {mErr.declare ? <span className="bk-err">{mErr.declare}</span> : null}

            <button className="sc-cta bk-submit" type="submit">
              Submit Membership Request
            </button>
            {mDone && !Object.keys(mErr).length ? (
              <div className="bk-success">
                Membership request submitted for review by the SCA Management
                Committee. We will contact you at{" "}
                <b>{mEmail || "your email"}</b> with the next steps.
              </div>
            ) : null}
          </form>
        )}
      </Modal>

      {/* ---------- DANDIYA TICKETS MODAL ---------- */}
      <Modal
        open={dandiyaOpen}
        onClose={closeDandiya}
        title={`${DANDIYA_NIGHT.eventName} — ${DANDIYA_NIGHT.date}`}
      >
        <div className="bk-d-modal">
          {/* Step indicators */}
          <div className="bk-steps" aria-label="Dandiya ticket steps">
            <span className={dStep >= 2 ? "bk-step bk-step--done" : "bk-step bk-step--on"}>
              <b>1</b> Tickets
            </span>
            <span className={dStep >= 3 ? "bk-step bk-step--done" : dStep === 2 ? "bk-step bk-step--on" : "bk-step"}>
              <b>2</b> Details
            </span>
            <span className={dStep >= 4 ? "bk-step bk-step--done" : dStep === 3 ? "bk-step bk-step--on" : "bk-step"}>
              <b>3</b> Summary
            </span>
            <span className={dStep === 4 ? "bk-step bk-step--on" : "bk-step"}>
              <b>4</b> Payment
            </span>
          </div>

          {/* Step 1 — Select tickets */}
          {dStep === 1 && (
            <div className="bk-d-panel">
              <div className="bk-d-hero">
                <span className="bk-d-hero-label">{DANDIYA_NIGHT.eventName}</span>
                <span className="bk-d-hero-date">{DANDIYA_NIGHT.date}</span>
              </div>

              <div className="bk-d-qty">
                <div className="bk-d-qty-head">Number of Tickets</div>
                <div className="bk-qty-row">
                  <div className="bk-stepper">
                    <button type="button" aria-label="Decrease quantity" onClick={() => setDQty((q) => Math.max(1, q - 1))}>−</button>
                    <input className="bk-input bk-qty-input" type="number" min={1} max={dMax} aria-label="Quantity" value={dQty} onChange={(e) => setDQty(Math.max(1, Math.min(dMax, Number(e.target.value) || 1)))} />
                    <button type="button" aria-label="Increase quantity" onClick={() => setDQty((q) => Math.min(dMax, q + 1))}>+</button>
                  </div>
                  <span className="bk-d-qty-max">Max {dMax} per booking</span>
                </div>
              </div>

              {dPrice !== null ? (
                <div className="bk-d-price-row">
                  <span>Price per ticket</span>
                  <strong>{DANDIYA_NIGHT.currency}{dPrice}</strong>
                </div>
              ) : (
                <div className="bk-d-price-row bk-d-price-row--pending">
                  <span>Price</span>
                  <em>To be announced</em>
                </div>
              )}

              <div className="bk-d-total-row">
                <span>Total</span>
                <strong>
                  {dTotal !== null
                    ? `${DANDIYA_NIGHT.currency}${dTotal}`
                    : "To be announced"}
                </strong>
              </div>

              <button type="button" className="sc-cta bk-submit" onClick={() => setDStep(2)}>
                Continue
              </button>
            </div>
          )}

          {/* Step 2 — Customer details */}
          {dStep === 2 && (
            <form className="bk-form" onSubmit={(e) => { e.preventDefault(); nextDandiya(); }} noValidate>
              <div className="bk-form-title">Your Details</div>
              <Field label="Full Name" required error={dErr.name}>
                <input className="bk-input" value={dName} onChange={(e) => setDName(e.target.value)} placeholder="Your full name" />
              </Field>
              <Field label="Mobile Number" required error={dErr.mobile}>
                <input className="bk-input" value={dMobile} onChange={(e) => setDMobile(e.target.value)} placeholder="e.g. 98765 43210" />
              </Field>
              <Field label="Email" required error={dErr.email}>
                <input className="bk-input" type="email" value={dEmail} onChange={(e) => setDEmail(e.target.value)} placeholder="you@example.com" />
              </Field>
              <div className="bk-d-btns">
                <button type="button" className="sc-cta--ghost bk-submit" onClick={() => setDStep(1)}>Back</button>
                <button type="submit" className="sc-cta bk-submit">Review Booking</button>
              </div>
            </form>
          )}

          {/* Step 3 — Booking summary */}
          {dStep === 3 && (
            <div className="bk-d-panel">
              <div className="bk-form-title">Booking Summary</div>
              <div className="bk-d-summary">
                <div className="bk-d-summary-row"><span>Event</span><strong>{DANDIYA_NIGHT.eventName}</strong></div>
                <div className="bk-d-summary-row"><span>Date</span><strong>{DANDIYA_NIGHT.date}</strong></div>
                <div className="bk-d-summary-row"><span>Tickets</span><strong>{dQty}</strong></div>
                <div className="bk-d-summary-row">
                  <span>Price per ticket</span>
                  <strong>{dPrice !== null ? `${DANDIYA_NIGHT.currency}${dPrice}` : "To be announced"}</strong>
                </div>
                <div className="bk-d-summary-row bk-d-summary-row--total">
                  <span>Total</span>
                  <strong>{dTotal !== null ? `${DANDIYA_NIGHT.currency}${dTotal}` : "To be announced"}</strong>
                </div>
              </div>
              <div className="bk-d-summary-details">
                <div><span>Name</span><strong>{dName}</strong></div>
                <div><span>Mobile</span><strong>{dMobile}</strong></div>
                <div><span>Email</span><strong>{dEmail}</strong></div>
              </div>
              <div className="bk-d-btns">
                <button type="button" className="sc-cta--ghost bk-submit" onClick={() => setDStep(2)}>Back</button>
                <button type="button" className="sc-cta bk-submit" onClick={() => setDStep(4)}>
                  {DANDIYA_NIGHT.payment.status === "configured" ? "Continue to Payment" : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Payment */}
          {dStep === 4 && (
            <div className="bk-d-panel">
              <div className="bk-form-title">
                {DANDIYA_NIGHT.payment.status === "configured" ? "Payment" : "Booking Confirmed"}
              </div>

              {DANDIYA_NIGHT.payment.status === "configured" ? (
                <div className="bk-d-payment">
                  <p className="bk-d-payment-instructions">{DANDIYA_NIGHT.payment.instructions}</p>
                  {DANDIYA_NIGHT.payment.url ? (
                    <a className="sc-cta bk-submit" href={DANDIYA_NIGHT.payment.url} target="_blank" rel="noopener noreferrer">
                      Pay Now
                    </a>
                  ) : (
                    <button className="sc-cta bk-submit" type="button" disabled>
                      Pay via {DANDIYA_NIGHT.payment.method}
                    </button>
                  )}
                  <button type="button" className="sc-cta--ghost bk-submit" onClick={closeDandiya}>
                    Close
                  </button>
                </div>
              ) : (
                <div className="bk-d-pending">
                  <p>{DANDIYA_NIGHT.payment.instructions}</p>
                  <div className="bk-d-summary">
                    <div className="bk-d-summary-row"><span>Event</span><strong>{DANDIYA_NIGHT.eventName}</strong></div>
                    <div className="bk-d-summary-row"><span>Date</span><strong>{DANDIYA_NIGHT.date}</strong></div>
                    <div className="bk-d-summary-row"><span>Tickets</span><strong>{dQty}</strong></div>
                    <div className="bk-d-summary-row bk-d-summary-row--total">
                      <span>Total</span>
                      <strong>{dTotal !== null ? `${DANDIYA_NIGHT.currency}${dTotal}` : "To be announced"}</strong>
                    </div>
                  </div>
                  <button type="button" className="sc-cta bk-submit" onClick={closeDandiya}>
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
