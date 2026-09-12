/*
 * Route-aware continuous scroll — the explicit boundary model.
 *
 * The site is four real routes in a fixed journey order. Strict route
 * ownership (§21: one route = one page) means each route's page is the ONLY
 * content of its own document, so a route's start and end are exactly its
 * document scroll extremes:
 *
 *   start = 0                                  (top of the route)
 *   end   = scrollHeight − viewportHeight      (bottom of the route)
 *
 * About's 5760px pin lives entirely inside /about's own document: its bottom
 * IS the end of the 7-chapter cinematic run, and Chapter 2 sits mid-pin, far
 * from either extreme. No cross-route markers exist in any document, so the
 * old useScrollSection desync (About pin spacing measured through unrelated
 * markers → wrong section) is impossible here by construction.
 *
 * Journey:
 *   DOWN:  / -> /about(top) -> /events(top) -> /booking(top) -> stay
 *   UP:    stay <- /(bottom) <- /about(end) <- /events(bottom) <- /booking
 *
 * Module-level state is safe here: it survives client-side router.push
 * (the JS bundle never unloads), which is exactly how the pending-entry
 * marker travels from the departing route to the arriving one.
 */

export const ROUTE_ORDER = ["/", "/about", "/events", "/booking"] as const;

export type Route = (typeof ROUTE_ORDER)[number];

/** Where the arriving route should place the viewport. */
export type EntryPosition = "start" | "end";

export function isRoute(value: string): value is Route {
  return (ROUTE_ORDER as readonly string[]).includes(value);
}

export function nextRoute(route: string): Route | null {
  const i = ROUTE_ORDER.indexOf(route as Route);
  return i >= 0 && i < ROUTE_ORDER.length - 1 ? ROUTE_ORDER[i + 1] : null;
}

export function prevRoute(route: string): Route | null {
  const i = ROUTE_ORDER.indexOf(route as Route);
  return i > 0 ? ROUTE_ORDER[i - 1] : null;
}

/*
 * Transition lock. Acquired on the first boundary crossing of a gesture,
 * released once the arriving route has placed the viewport and settled.
 * A timestamp expiry backstops routes that never mount (nav click away,
 * failed push) so the journey can never deadlock.
 */
const LOCK_MS = 2000;
let lockHeld = false;
let lockAcquiredAt = 0;

function lockExpired(): boolean {
  return Date.now() - lockAcquiredAt > LOCK_MS;
}

export function isTransitionLocked(): boolean {
  if (!lockHeld) return false;
  if (lockExpired()) {
    lockHeld = false;
    return false;
  }
  return true;
}

export function acquireTransitionLock(): boolean {
  if (isTransitionLocked()) return false;
  lockHeld = true;
  lockAcquiredAt = Date.now();
  return true;
}

export function releaseTransitionLock(): void {
  lockHeld = false;
}

/* Pending entry marker: set right before router.push, consumed on arrival. */
let planned: { route: Route; position: EntryPosition } | null = null;

export function planEntry(route: Route, position: EntryPosition): void {
  planned = { route, position };
}

export function takePlannedEntry(): { route: Route; position: EntryPosition } | null {
  const p = planned;
  planned = null;
  return p;
}