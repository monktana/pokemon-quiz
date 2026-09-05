/**
 * The only file in the codebase allowed to call Math.random() directly.
 * Everything else goes through one of these, so a test can mock exactly the
 * decision it cares about instead of the shared global.
 */

export const chance = (probability: number): boolean => Math.random() < probability;

export const randomItem = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

// Same shuffle as before (still `sort` with a random comparator, still not
// perfectly uniform) - only the Math.random() call site moved, behavior
// didn't change.
export const shuffle = <T>(items: T[]): T[] => [...items].sort(() => Math.random() - 0.5);
