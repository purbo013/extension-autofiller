import type { DetectedCheckbox, DetectedField, FieldType } from "../generators/types";
import { GEO_FIELD_ORDER, SKIP_CHECKBOX_KEYWORDS } from "../shared/constants";
import { isVisible, normalizeText } from "../shared/utils";
import { getFieldContextText } from "./label-utils";
import { matchFieldType } from "./semantic-matcher";
const FIELD_SELECTOR = [
  "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']):not([type='image']):not([type='file'])",
  "textarea",
  "select",
].join(", ");

function isSkippableCheckbox(element: HTMLInputElement): boolean {
  const context = normalizeText(getFieldContextText(element));
  return SKIP_CHECKBOX_KEYWORDS.some((keyword) => context.includes(keyword));
}

function geoSortIndex(fieldType: FieldType): number {
  const index = GEO_FIELD_ORDER.indexOf(fieldType as typeof GEO_FIELD_ORDER[number]);
  return index === -1 ? 99 : index;
}

function detectVueMultiselectFields(root: ParentNode): DetectedField[] {
  const hosts = new Set<HTMLElement>();

  for (const host of root.querySelectorAll<HTMLElement>("multiselect")) {
    hosts.add(host);
  }

  for (const node of root.querySelectorAll<HTMLElement>(".multiselect")) {
    if (node.closest("multiselect")) continue;
    hosts.add(node);
  }

  const detected: DetectedField[] = [];
  for (const host of hosts) {
    if (!isVisible(host)) continue;
    const fillRoot = host.tagName.toLowerCase() === "multiselect"
      ? host.querySelector<HTMLElement>(".multiselect") ?? host
      : host;
    if (fillRoot.classList.contains("multiselect--disabled")) continue;

    const { fieldType, score, signals } = matchFieldType(host);
    detected.push({ element: host, signals, fieldType, score });
  }

  return detected;
}

export function detectFields(root: ParentNode = document): DetectedField[] {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(FIELD_SELECTOR));
  const detected: DetectedField[] = detectVueMultiselectFields(root);

  for (const element of elements) {
    if (element.closest("multiselect, .multiselect, .bgi-file-zone, .bgi-detail-search-wrap")) continue;

    if (element instanceof HTMLInputElement) {
      if (element.type === "radio" || element.type === "checkbox") continue;
    }

    if (
      (element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement) &&
      (element.disabled || ("readOnly" in element && element.readOnly))
    ) {
      continue;
    }

    const { fieldType, score, signals } = matchFieldType(element);
    detected.push({ element, signals, fieldType, score });
  }

  return detected.sort((a, b) => {
    const geoDiff = geoSortIndex(a.fieldType) - geoSortIndex(b.fieldType);
    if (geoDiff !== 0) return geoDiff;
    const aVisible = isVisible(a.element) ? 0 : 1;
    const bVisible = isVisible(b.element) ? 0 : 1;
    return aVisible - bVisible || b.score - a.score;
  });
}

export function detectCheckboxes(root: ParentNode = document): DetectedCheckbox[] {
  const checkboxes = Array.from(root.querySelectorAll<HTMLInputElement>("input[type='checkbox']:not(:disabled)"));
  const results: DetectedCheckbox[] = [];

  for (const element of checkboxes) {
    if (isSkippableCheckbox(element)) continue;
    const signals = [getFieldContextText(element)];
    results.push({
      element,
      signals,
      isProgramCheckbox: true,
    });
  }

  return results;
}

export function detectRadioGroups(
  root: ParentNode = document,
): Array<{ name: string; fieldType: FieldType; elements: HTMLInputElement[] }> {
  const radios = Array.from(root.querySelectorAll<HTMLInputElement>("input[type='radio']:not(:disabled)"));
  const groups = new Map<string, HTMLInputElement[]>();

  for (const radio of radios) {
    if (!radio.name) continue;
    const existing = groups.get(radio.name) ?? [];
    existing.push(radio);
    groups.set(radio.name, existing);
  }

  const results: Array<{ name: string; fieldType: FieldType; elements: HTMLInputElement[] }> = [];

  for (const [name, elements] of groups) {
    const { fieldType } = matchFieldType(elements[0]);
    results.push({ name, fieldType, elements });
  }

  return results;
}

export function countFillableElements(root: ParentNode = document): number {
  const fields = detectFields(root).length;
  const checkboxes = detectCheckboxes(root).length;
  const radios = detectRadioGroups(root).length;
  return fields + checkboxes + radios;
}
