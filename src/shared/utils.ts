export function randomPick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function padNumber(value: number, length: number): string {
  return String(value).padStart(length, "0");
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(text: string): string {
  return normalizeText(text).replace(/\s+/g, "");
}

export function fuzzyMatch(target: string, candidate: string): number {
  const a = normalizeText(target);
  const b = normalizeText(candidate);

  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.85;

  const aTokens = a.split(" ").filter(Boolean);
  const bTokens = b.split(" ").filter(Boolean);
  const overlap = aTokens.filter((token) => bTokens.some((other) => other.includes(token) || token.includes(other)));

  if (overlap.length === 0) return 0;
  return overlap.length / Math.max(aTokens.length, bTokens.length);
}

export function bestFuzzyMatch<T extends string>(
  target: string,
  candidates: readonly T[],
): T | null {
  let best: T | null = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = fuzzyMatch(target, candidate);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return bestScore >= 0.5 ? best : null;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isVisible(element: HTMLElement): boolean {
  if (!(element instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}
