import { NEXT_STEP_AFTER_CLICK_MS, NEXT_STEP_TRANSITION_MS } from "../shared/constants";
import { delay, isVisible, normalizeText } from "../shared/utils";
import { countFillableElements } from "./field-detector";

const NEXT_STEP_SELECTOR = [
  "button",
  "input[type='button']",
  "input[type='submit']",
  "a[role='button']",
  "[role='button']",
].join(", ");

const NEXT_LABEL_PATTERNS: RegExp[] = [
  /\b(selanjutnya|berikutnya)\b/,
  /\blanjut(kan)?\b/,
  /\bnext\b/,
  /\bcontinue\b/,
  /\bproceed\b/,
  /\bmelanjutkan\b/,
];

const BLOCK_LABEL_PATTERNS: RegExp[] = [
  /\b(kembali|back|previous|sebelumnya)\b/,
  /\b(batal|cancel)\b/,
  /\b(kirim|submit|daftar|register|sign\s*up)\b/,
  /\b(selesai|finish|done)\b/,
];

function getControlLabel(element: HTMLElement): string {
  const parts = [
    element.getAttribute("aria-label") ?? "",
    element.getAttribute("title") ?? "",
    element.getAttribute("value") ?? "",
    element.textContent ?? "",
    Array.from(element.classList).join(" "),
    element.getAttribute("data-testid") ?? "",
    element.getAttribute("name") ?? "",
  ];
  return normalizeText(parts.join(" "));
}

function isDisabledControl(element: HTMLElement): boolean {
  if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
    return element.disabled;
  }
  return element.getAttribute("aria-disabled") === "true";
}

function scoreNextStepControl(element: HTMLElement): number {
  const label = getControlLabel(element);
  if (!label) return 0;

  if (BLOCK_LABEL_PATTERNS.some((pattern) => pattern.test(label))) {
    const hasNextHint = NEXT_LABEL_PATTERNS.some((pattern) => pattern.test(label));
    if (!hasNextHint) return 0;
  }

  let score = 0;
  for (const pattern of NEXT_LABEL_PATTERNS) {
    if (pattern.test(label)) score += 1;
  }

  if (/\bnext\b/.test(label) && /\bstep\b/.test(label)) score += 0.5;
  if (/\b(btn|button)[-_]?next\b/.test(label.replace(/\s+/g, ""))) score += 0.75;
  if (element.classList.contains("next") || element.classList.contains("btn-next")) score += 0.75;

  return score;
}

function findNextStepControl(root: ParentNode): HTMLElement | null {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(NEXT_STEP_SELECTOR));
  let best: HTMLElement | null = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    if (!isVisible(candidate) || isDisabledControl(candidate)) continue;

    const score = scoreNextStepControl(candidate);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return bestScore >= 0.75 ? best : null;
}

function clickControl(element: HTMLElement): void {
  element.scrollIntoView({ block: "center", inline: "nearest" });
  element.focus({ preventScroll: true });
  element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
  element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
  element.click();
}

async function waitForStepChange(root: ParentNode, beforeCount: number): Promise<void> {
  const deadline = Date.now() + NEXT_STEP_TRANSITION_MS;
  while (Date.now() < deadline) {
    await delay(120);
    const afterCount = countFillableElements(root);
    if (afterCount !== beforeCount) return;
  }
}

export async function tryAdvanceToNextStep(root: ParentNode): Promise<boolean> {
  const control = findNextStepControl(root);
  if (!control) return false;

  const beforeCount = countFillableElements(root);
  clickControl(control);
  await delay(NEXT_STEP_AFTER_CLICK_MS);
  await waitForStepChange(root, beforeCount);
  return true;
}
