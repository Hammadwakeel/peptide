export function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Returns `current` when equal to `next` so Zustand subscribers skip re-renders. */
export function patchIfChanged<T>(current: T, next: T, isEqual: (a: T, b: T) => boolean = jsonEqual): T {
  return isEqual(current, next) ? current : next;
}
