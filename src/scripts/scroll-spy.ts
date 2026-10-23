/**
 * Header polish + deep links: as the visitor scrolls, the URL hash follows the
 * section in view (#features, #about, ...) via history.replaceState, so it never
 * adds history entries or jumps the page; at the top of the page the hash is
 * removed. The matching nav link gets aria-current="true" and the sticky header
 * condenses once the page scrolls. Progressive enhancement only.
 */
export function initScrollSpy(): void {
  const header = document.querySelector("header");
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("#site-nav a[href^='#']"));

  const onScroll = (): void => {
    header?.toggleAttribute("data-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Every top-level page section tracks the hash; the hero is the "no hash" state.
  const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section[id]"));
  if (sections.length === 0) return;

  const highlight = (id: string): void => {
    links.forEach((link) => {
      if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  // The hash is written once scrolling settles, so a smooth scroll that passes
  // through other sections never leaves intermediate hashes behind.
  const syncHash = (id: string): void => {
    const next = id !== "hero" ? `#${id}` : "";
    if (window.location.hash === next) return;
    history.replaceState(history.state, "", window.location.pathname + window.location.search + next);
    // replaceState does not fire hashchange; the language switch listens for it
    // to keep its links on the current section.
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  // The current section is the last one whose top has passed a reference line
  // just under the sticky header (matches the nav links' scroll offset). At the
  // very bottom of the page the last section wins, since a short final section
  // can never reach the line. Runs on scroll only, so an initial deep link such
  // as /#about is never overwritten before the browser has jumped to it.
  const REFERENCE_LINE = 100;
  const SETTLE_MS = 120;
  let queued = false;
  let settleTimer = 0;
  const update = (): void => {
    queued = false;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= REFERENCE_LINE) current = section;
    }
    if (atBottom) current = sections[sections.length - 1];
    highlight(current.id);
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => syncHash(current.id), SETTLE_MS);
  };
  window.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );

  // Smooth scrolling is enabled only after load (see global.css).
  const enableSmooth = (): void => {
    requestAnimationFrame(() => document.documentElement.classList.add("smooth-scroll"));
  };
  if (document.readyState === "complete") enableSmooth();
  else window.addEventListener("load", enableSmooth, { once: true });
}
