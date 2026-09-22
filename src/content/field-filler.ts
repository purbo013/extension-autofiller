import type { DetectedCheckbox, DetectedField, FieldType, IndonesianProfile } from "../generators/types";
import { CASCADE_FILL_DELAY_MS, FIELD_FILL_DELAY_MS, GEO_FIELD_ORDER } from "../shared/constants";
import { delay, fuzzyMatch, isVisible, normalizeText, randomInt, randomPick } from "../shared/utils";
import { getFieldContextText } from "./label-utils";
import { getProfileValue } from "./semantic-matcher";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const GENDER_CANDIDATES: Record<"male" | "female", string[]> = {
  male: ["Laki-laki", "Laki Laki", "Laki-Laki", "Pria", "Laki", "Male", "M", "L"],
  female: ["Perempuan", "Wanita", "Female", "F", "P"],
};

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype = element instanceof HTMLInputElement
    ? HTMLInputElement.prototype
    : HTMLTextAreaElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  if (descriptor?.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }
}

function dispatchInputEvents(element: HTMLElement): void {
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}

function isPlaceholderOption(option: HTMLOptionElement): boolean {
  const text = normalizeText(option.textContent ?? "");
  const value = normalizeText(option.value);
  if (!text && !value) return true;
  return ["pilih", "select", "choose", "--", "none", "semua", "all"].some((token) => text.startsWith(token));
}

function getValidSelectOptions(select: HTMLSelectElement): HTMLOptionElement[] {
  return Array.from(select.options).filter((option, index) => {
    if (option.disabled) return false;
    if (index === 0 && isPlaceholderOption(option)) return false;
    return Boolean(option.value || option.textContent?.trim());
  });
}

function findBestSelectOption(select: HTMLSelectElement, targetValues: string[]): HTMLOptionElement | null {
  const validOptions = getValidSelectOptions(select);
  if (validOptions.length === 0) return null;

  let bestOption: HTMLOptionElement | null = null;
  let bestScore = 0;

  for (const option of validOptions) {
    for (const targetValue of targetValues) {
      const score = Math.max(
        fuzzyMatch(targetValue, option.textContent ?? ""),
        fuzzyMatch(targetValue, option.value),
      );
      if (score > bestScore) {
        bestScore = score;
        bestOption = option;
      }
    }
  }

  if (bestOption && bestScore >= 0.35) return bestOption;
  return randomPick(validOptions);
}

function shouldFormatAsDate(fieldType: FieldType, element: HTMLInputElement, value: string): boolean {
  if (fieldType !== "birthDate" && element.type !== "date") return false;
  return ISO_DATE_PATTERN.test(value);
}

function formatDateValue(value: string, element: HTMLInputElement): string {
  const [year, month, day] = value.split("-");
  const context = normalizeText(getFieldContextText(element));

  if (element.type === "date") return value;
  if (context.includes("tahun") || element.maxLength === 4) return year;
  if (context.includes("bulan") || (element.maxLength === 2 && Number(element.max) <= 12)) return month;
  if (context.includes("tanggal") || context.includes("tgl")) return day;
  if (element.maxLength === 2) return day;
  if (element.maxLength === 4) return year;
  return `${day}/${month}/${year}`;
}

function fillTextLike(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
  fieldType: FieldType,
): boolean {
  if (element.value?.trim()) return false;

  let finalValue = value;
  if (element instanceof HTMLInputElement && shouldFormatAsDate(fieldType, element, value)) {
    finalValue = formatDateValue(value, element);
  }

  setNativeValue(element, finalValue);
  dispatchInputEvents(element);
  return true;
}

function getSelectTargetValues(fieldType: FieldType, profile: IndonesianProfile, value: string): string[] {
  if (fieldType === "gender") {
    return GENDER_CANDIDATES[profile.gender];
  }
  return [value];
}

function fillSelect(element: HTMLSelectElement, value: string, fieldType: FieldType, profile: IndonesianProfile): boolean {
  if (element.value && !isPlaceholderOption(element.selectedOptions[0] ?? element.options[0])) {
    return false;
  }

  const targetValues = getSelectTargetValues(fieldType, profile, value);
  const option = findBestSelectOption(element, targetValues);
  if (!option) return false;

  element.value = option.value;
  dispatchInputEvents(element);
  return true;
}

function fillRadioGroup(elements: HTMLInputElement[], value: string, profile: IndonesianProfile): boolean {
  if (elements.some((radio) => radio.checked)) return false;

  const candidates = value ? [value, ...GENDER_CANDIDATES[profile.gender]] : GENDER_CANDIDATES[profile.gender];
  let bestRadio: HTMLInputElement | null = null;
  let bestScore = 0;

  for (const radio of elements) {
    const label = radio.id ? document.querySelector(`label[for="${CSS.escape(radio.id)}"]`)?.textContent ?? "" : "";
    for (const candidate of candidates) {
      const score = Math.max(
        fuzzyMatch(candidate, label),
        fuzzyMatch(candidate, radio.value),
        fuzzyMatch(candidate, radio.getAttribute("aria-label") ?? ""),
      );
      if (score > bestScore) {
        bestScore = score;
        bestRadio = radio;
      }
    }
  }

  const selected = bestScore >= 0.25 ? bestRadio : randomPick(elements);
  if (!selected) return false;

  selected.checked = true;
  dispatchInputEvents(selected);
  return true;
}

function fillCheckbox(element: HTMLInputElement): boolean {
  if (element.checked) return false;
  element.checked = true;
  dispatchInputEvents(element);
  return true;
}

function getGenericValue(field: DetectedField, profile: IndonesianProfile): string {
  const label = normalizeText(field.signals.find((signal) => signal.length < 40) ?? "");
  const attrs = normalizeText(field.signals.slice(0, 6).join(" "));
  const context = `${attrs} ${label}`;

  if (/\b(latitude|lintang)\b/.test(context) || /\blat\b/.test(context)) return profile.latitude;
  if (/\b(longitude|bujur)\b/.test(context) || /\b(lng|lon)\b/.test(context)) return profile.longitude;
  if (/\b(no[.\s]?kk|kartu keluarga|nokk)\b/.test(context)) {
    return profile.familyCardNumber;
  }
  if (/\bnik\b/.test(context) && !/\bnokk\b/.test(context)) return profile.nik;
  if (/\bnama\b/.test(context)) return profile.fullName;
  if (context.includes("alamat")) {
    return `${profile.address.street}, RT ${profile.address.rt}/RW ${profile.address.rw}`;
  }
  if (context.includes("pengeluaran")) return profile.monthlyExpense;
  if (context.includes("aset")) return profile.assets;
  if (context.includes("sarana") || context.includes("prasarana")) return profile.facilities;
  if (field.fieldType === "genericNumber" || (field.element instanceof HTMLInputElement && field.element.type === "number")) {
    return String(randomInt(100_000, 5_000_000));
  }

  return `Data ${randomInt(100, 999)}`;
}

function isNumericOnly(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

function isCoordinateField(field: DetectedField): boolean {
  const context = normalizeText(field.signals.join(" "));
  return (
    field.fieldType === "latitude" ||
    field.fieldType === "longitude" ||
    /\b(latitude|longitude|lintang|bujur)\b/.test(context) ||
    /\b(lat|lng|lon)\b/.test(context)
  );
}

function ensure16Digits(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 16) return digits;
  if (digits.length > 16) return digits.slice(0, 16);
  return digits.padStart(16, "0");
}

function resolveFieldValue(field: DetectedField, profile: IndonesianProfile): string {
  let value = getProfileValue(field.fieldType, profile);

  if (!value && field.fieldType.startsWith("generic")) {
    value = getGenericValue(field, profile);
  }

  if (field.fieldType === "fullName" && isNumericOnly(value)) {
    value = profile.fullName;
  }

  if (field.fieldType === "nik" && value === profile.familyCardNumber) {
    value = profile.nik;
  }

  if (field.fieldType === "familyCardNumber" && value === profile.nik) {
    value = profile.familyCardNumber;
  }

  if ((field.fieldType === "nik" || field.fieldType === "familyCardNumber") && !isCoordinateField(field)) {
    value = ensure16Digits(value);
  }

  return value;
}

async function fillDetectedField(field: DetectedField, profile: IndonesianProfile): Promise<boolean> {
  const value = resolveFieldValue(field, profile);
  if (!value) return false;

  const element = field.element;

  if (element instanceof HTMLSelectElement) {
    return fillSelect(element, value, field.fieldType, profile);
  }

  if (element instanceof HTMLTextAreaElement) {
    return fillTextLike(element, value, field.fieldType);
  }

  if (element instanceof HTMLInputElement) {
    return fillTextLike(element, value, field.fieldType);
  }

  return false;
}

function isGeoField(fieldType: FieldType): boolean {
  return GEO_FIELD_ORDER.includes(fieldType as typeof GEO_FIELD_ORDER[number]);
}

function isFieldEmpty(field: DetectedField): boolean {
  const element = field.element;
  if (element instanceof HTMLSelectElement) {
    const selected = element.selectedOptions[0] ?? element.options[0];
    return !element.value || isPlaceholderOption(selected);
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return !element.value.trim();
  }
  return true;
}

function isCorruptedValue(value: string): boolean {
  return value.includes("undefined");
}

function resetCorruptedFields(fields: DetectedField[]): void {
  for (const field of fields) {
    const element = field.element;
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      if (isCorruptedValue(element.value)) {
        setNativeValue(element, "");
      }
    }
  }
}

export async function fillForm(
  profile: IndonesianProfile,
  fields: DetectedField[],
  radioGroups: Array<{ fieldType: FieldType; elements: HTMLInputElement[] }>,
  checkboxes: DetectedCheckbox[],
  onlyEmpty = false,
): Promise<number> {
  resetCorruptedFields(fields);

  let filled = 0;
  const usedElements = new Set<HTMLElement>();

  for (const field of fields) {
    if (!isVisible(field.element) && field.element.getAttribute("type") !== "hidden") {
      continue;
    }
    if (onlyEmpty && !isFieldEmpty(field)) continue;
    if (usedElements.has(field.element)) continue;

    const success = await fillDetectedField(field, profile);
    if (success) {
      filled += 1;
      usedElements.add(field.element);
    }

    await delay(isGeoField(field.fieldType) ? CASCADE_FILL_DELAY_MS : FIELD_FILL_DELAY_MS);
  }

  for (const group of radioGroups) {
    const value = getProfileValue(group.fieldType, profile);
    const success = fillRadioGroup(group.elements, value, profile);
    if (success) filled += 1;
    await delay(FIELD_FILL_DELAY_MS);
  }

  for (const checkbox of checkboxes) {
    if (!isVisible(checkbox.element)) continue;
    const success = fillCheckbox(checkbox.element);
    if (success) filled += 1;
    await delay(FIELD_FILL_DELAY_MS);
  }

  return filled;
}
