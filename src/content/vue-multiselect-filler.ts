import type { FieldType, IndonesianProfile } from "../generators/types";
import { FIELD_FILL_DELAY_MS } from "../shared/constants";
import { delay, fuzzyMatch, isVisible, normalizeText, randomPick } from "../shared/utils";
import { getSelectTargetValues } from "./select-utils";

const OPTION_SELECTOR = ".multiselect__option:not(.multiselect__option--disabled)";

export function isVueMultiselectHost(element: HTMLElement): boolean {
  const tag = element.tagName.toLowerCase();
  if (tag === "multiselect") return true;
  return element.classList.contains("multiselect");
}

export function getVueMultiselectFillRoot(host: HTMLElement): HTMLElement {
  if (host.tagName.toLowerCase() === "multiselect") {
    return host.querySelector<HTMLElement>(".multiselect") ?? host;
  }
  return host;
}

function isDisabled(fillRoot: HTMLElement): boolean {
  return (
    fillRoot.classList.contains("multiselect--disabled") ||
    fillRoot.getAttribute("aria-disabled") === "true"
  );
}

function isPlaceholderText(text: string): boolean {
  const normalized = normalizeText(text);
  if (!normalized || normalized === "-") return true;
  return ["pilih", "select", "choose", "--", "none"].some((token) => normalized.startsWith(token));
}

export function isVueMultiselectEmpty(host: HTMLElement): boolean {
  const fillRoot = getVueMultiselectFillRoot(host);
  if (fillRoot.querySelector(".multiselect__tag")) return false;

  const placeholder = fillRoot.querySelector(".multiselect__placeholder");
  if (placeholder && isVisible(placeholder as HTMLElement)) return true;

  const single = fillRoot.querySelector(".multiselect__single");
  const singleText = normalizeText(single?.textContent ?? "");
  return isPlaceholderText(singleText);
}

function setInputValue(input: HTMLInputElement, value: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  if (descriptor?.set) {
    descriptor.set.call(input, value);
  } else {
    input.value = value;
  }
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "a" }));
}

function clickElement(element: HTMLElement): void {
  element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
  element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
  element.click();
}

function collectOptions(fillRoot: HTMLElement): HTMLElement[] {
  const inRoot = Array.from(fillRoot.querySelectorAll<HTMLElement>(OPTION_SELECTOR)).filter((el) =>
    isVisible(el),
  );
  if (inRoot.length > 0) return inRoot;

  const active = document.querySelector<HTMLElement>(".multiselect--active");
  if (!active) return [];

  return Array.from(active.querySelectorAll<HTMLElement>(OPTION_SELECTOR)).filter((el) => isVisible(el));
}

function findBestOption(options: HTMLElement[], targetValues: string[]): HTMLElement | null {
  if (options.length === 0) return null;

  let best: HTMLElement | null = null;
  let bestScore = 0;

  for (const option of options) {
    const text = option.textContent ?? "";
    for (const target of targetValues) {
      const score = fuzzyMatch(target, text);
      if (score > bestScore) {
        bestScore = score;
        best = option;
      }
    }
  }

  if (best && bestScore >= 0.35) return best;
  return randomPick(options);
}

async function openDropdown(fillRoot: HTMLElement): Promise<void> {
  const opener =
    fillRoot.querySelector<HTMLElement>(".multiselect__tags") ??
    fillRoot.querySelector<HTMLElement>(".multiselect__select") ??
    fillRoot;
  clickElement(opener);
  await delay(80);
}

async function waitForOptions(fillRoot: HTMLElement, attempts = 12): Promise<HTMLElement[]> {
  for (let i = 0; i < attempts; i += 1) {
    const options = collectOptions(fillRoot);
    if (options.length > 0) return options;
    await delay(100);
  }
  return [];
}

export async function fillVueMultiselect(
  host: HTMLElement,
  value: string,
  fieldType: FieldType,
  profile: IndonesianProfile,
): Promise<boolean> {
  const fillRoot = getVueMultiselectFillRoot(host);
  if (!isVisible(fillRoot) || isDisabled(fillRoot)) return false;
  if (!isVueMultiselectEmpty(host)) return false;

  const targetValues = getSelectTargetValues(fieldType, profile, value);
  await openDropdown(fillRoot);

  const searchInput = fillRoot.querySelector<HTMLInputElement>(".multiselect__input");
  const searchHint = targetValues.find((target) => target.length >= 3) ?? targetValues[0];
  if (searchInput && searchHint) {
    setInputValue(searchInput, searchHint.slice(0, 24));
    await delay(200);
  }

  const options = await waitForOptions(fillRoot);
  const option = findBestOption(options, targetValues);
  if (!option) {
    fillRoot.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
    return false;
  }

  option.scrollIntoView({ block: "nearest" });
  clickElement(option);
  await delay(FIELD_FILL_DELAY_MS);
  return !isVueMultiselectEmpty(host);
}
