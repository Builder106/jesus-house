import { Injectable } from '@angular/core';

interface ScrubEntry<T> {
  measure: () => T;
  apply: (value: T) => void;
}

interface ScrubTask {
  measure: () => (() => void) | null;
}

/**
 * jhScrollScrubber — the site's one scroll/resize listener.
 *
 * Every pinned scene (hero, ride, audience, values, story) and the ride-
 * progress rail independently read layout geometry (`getBoundingClientRect`,
 * `offsetHeight`) and immediately write a CSS custom property in response to
 * scroll. With several of these mounted at once, one component's write
 * invalidates layout right before the next component's read — forcing the
 * browser to synchronously recompute layout over and over on every scroll
 * frame (a measured 320ms of forced-reflow time during a single upward
 * scroll burst, mobile CPU-throttled). Fast corrective "scroll back up"
 * gestures generate more scroll events per second than a slow read-and-
 * scroll-down, so this thrashing is disproportionately felt scrolling up.
 *
 * The fix is the standard batched-read/batched-write pattern: every
 * registered consumer's `measure()` runs before ANY consumer's `apply()` on
 * a given frame, so no write can invalidate a read that hasn't happened yet.
 *
 * Consumers register while their pinned mechanic is active and unregister
 * when it isn't (the reactive `(min-height: 500px)` gate), so the scrubber
 * only ever does the work its currently-active consumers need.
 */
@Injectable({ providedIn: 'root' })
export class ScrollScrubber {
  private readonly tasks = new Set<ScrubTask>();
  private ticking = false;
  private listening = false;

  /** Registers a scroll/resize-driven read+write pair. Returns an
   *  unregister function — call it once the consumer no longer needs
   *  per-frame updates (e.g. its active-viewport gate turns off, or on
   *  directive destroy). */
  register<T>(entry: ScrubEntry<T>): () => void {
    const task: ScrubTask = {
      measure: () => {
        const value = entry.measure();
        return () => entry.apply(value);
      },
    };
    this.tasks.add(task);
    this.ensureListening();
    this.schedule();
    return () => {
      this.tasks.delete(task);
    };
  }

  /** Force a batched pass outside of scroll/resize — e.g. after webfonts
   *  land or a ResizeObserver fires, both of which can shift layout without
   *  a scroll/resize event of their own. */
  requestUpdate(): void {
    this.schedule();
  }

  private ensureListening(): void {
    if (this.listening) return;
    this.listening = true;
    window.addEventListener('scroll', this.onEvent, { passive: true });
    window.addEventListener('resize', this.onEvent, { passive: true });
  }

  private readonly onEvent = (): void => this.schedule();

  private schedule(): void {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      // READ phase — every measure() runs before any apply(), so a write
      // from one consumer can never force a layout recompute for the next
      // consumer's read. Each consumer is isolated: an exception in one
      // (e.g. a device-specific API quirk) must not freeze every pinned
      // scene's --zoom for the rest of the session.
      const writes: Array<() => void> = [];
      for (const task of this.tasks) {
        try {
          const apply = task.measure();
          if (apply) writes.push(apply);
        } catch {
          /* skip this consumer this frame */
        }
      }
      // WRITE phase — same isolation.
      for (const apply of writes) {
        try {
          apply();
        } catch {
          /* skip */
        }
      }
    });
  }
}
