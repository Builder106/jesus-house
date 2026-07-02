/**
 * isDarkGroundInBand — shared "is a dark scene under this fixed UI element
 * right now" check.
 *
 * Sections mark themselves with `data-jh-header-dark` (see site-header.ts's
 * class doc for the three modes: bare/`until-veil`/`when-veiled`, and how
 * `data-jh-header-dark-veil` factors in). Originally written for the header
 * pill, it's identical for any other fixed element that wants to react to
 * the same dark/light ground — the ride-progress rail uses it too, since a
 * light rail track over the night story/RCF/glass-dive scenes reads as a
 * stray pale line rather than a deliberate motif.
 *
 * Pass the element's own viewport-space vertical band (top/bottom in CSS
 * px). Reading a mark's `getComputedStyle` opacity mid-scroll is one frame
 * stale relative to whichever scene consumer writes it in the same
 * ScrollScrubber batch — imperceptible for a binary dark/light flip.
 */
export function isDarkGroundInBand(bandTop: number, bandBottom: number): boolean {
  for (const el of document.querySelectorAll<HTMLElement>('[data-jh-header-dark]')) {
    const r = el.getBoundingClientRect();
    if (r.height === 0 || r.top >= bandBottom || r.bottom <= bandTop) continue;
    const mode = el.getAttribute('data-jh-header-dark') || 'dark';
    if (mode === 'dark') return true;
    const veil = el.querySelector('[data-jh-header-dark-veil]');
    const veiled = veil ? parseFloat(getComputedStyle(veil).opacity) > 0.5 : false;
    if (mode === 'until-veil' ? !veiled : veiled) return true;
  }
  return false;
}
