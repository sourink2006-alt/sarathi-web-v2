/*
 * SCA brand lockup — logo + "SARATHI / CULTURAL ASSOCIATION" wordmark on the
 * left, sticker emblem top-right. Matches the original SCA branding type,
 * spacing and proportions (reusing the same title/sub typography classes) but
 * WITHOUT any navigation bar, links or active states — pure branding.
 */
export function BrandLockup() {
  return (
    <>
      <div className="sc-brand-left">
        <img
          src="/logo.png"
          alt="Sarathi Cultural Association — circular Durga eyes logo"
          className="sc-brand-logo"
        />
        <span className="sc-brand-word" aria-hidden="true">
          <span className="sc-nav-title">Sarathi</span>
          <span className="sc-nav-sub">Cultural Association</span>
        </span>
      </div>
      <img
        src="/name.png"
        alt="SCA Sarathi Cultural Association"
        className="sc-brand-emblem"
      />
    </>
  );
}
