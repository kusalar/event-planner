import type confetti from 'canvas-confetti';

type ConfettiFn = typeof confetti;

let confettiFnPromise: Promise<ConfettiFn> | null = null;

/**
 * Triggers celebratory confetti animation on demand.
 * Dynamically loads canvas-confetti only when invoked to keep page bundle sizes lean.
 */
export async function triggerConfetti(options?: confetti.Options): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    if (!confettiFnPromise) {
      confettiFnPromise = import('canvas-confetti').then((mod) => {
        const fn = (mod as unknown as { default?: ConfettiFn }).default || (mod as unknown as ConfettiFn);
        return fn;
      });
    }
    const confettiInstance = await confettiFnPromise;
    if (typeof confettiInstance === 'function') {
      confettiInstance(options);
    }
  } catch (error) {
    // Graceful fallback: do not break caller execution if confetti fails to load
    console.warn('Confetti animation unavailable:', error);
  }
}
