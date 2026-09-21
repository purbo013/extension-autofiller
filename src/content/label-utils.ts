import type { FieldType } from "../generators/types";
import { normalizeText } from "../shared/utils";

const LABEL_SELECTOR = "label, legend, .label, .form-label, .control-label, th";

export function getElementSignals(element: HTMLElement): string[] {
  const signals: string[] = [];
  const attrs = ["name", "id", "placeholder", "aria-label", "autocomplete", "data-field", "data-name", "title"];

  for (const attr of attrs) {
    const value = element.getAttribute(attr);
    if (value) signals.push(value);
  }

  if (element instanceof HTMLInputElement) {
    signals.push(element.type);
  } else if (element instanceof HTMLSelectElement) {
    signals.push("select");
  } else if (element instanceof HTMLTextAreaElement) {
    signals.push("textarea");
  }

  const label = findLabelText(element);
  if (label) signals.push(label);

  const nearby = findNearbyText(element);
  if (nearby && nearby !== label) signals.push(nearby);

  return signals;
}

function getLabelElementText(element: Element): string | null {
  if (element.matches(LABEL_SELECTOR)) {
    return element.textContent?.trim() ?? null;
  }
  const inner = element.querySelector(LABEL_SELECTOR);
  return inner?.textContent?.trim() ?? null;
}

function findPrecedingLabel(element: HTMLElement): string | null {
  let current: HTMLElement | null = element;

  while (current) {
    let sibling: Element | null = current.previousElementSibling;
    while (sibling) {
      const labelText = getLabelElementText(sibling);
      if (labelText && labelText.length < 80) return labelText;
      sibling = sibling.previousElementSibling;
    }
    current = current.parentElement;
  }

  return null;
}

export function findLabelText(element: HTMLElement): string | null {
  if (element.id) {
    const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (label?.textContent) return label.textContent.trim();
  }

  const parentLabel = element.closest("label");
  if (parentLabel?.textContent) return parentLabel.textContent.trim();

  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement?.textContent) return labelElement.textContent.trim();
  }

  const cell = element.closest("td, th");
  if (cell) {
    const row = cell.closest("tr");
    if (row) {
      const cells = Array.from(row.querySelectorAll("td, th"));
      const index = cells.indexOf(cell as HTMLTableCellElement);
      if (index > 0) {
        const labelCell = cells[index - 1];
        if (labelCell?.textContent) return labelCell.textContent.trim();
      }
    }
  }

  const preceding = findPrecedingLabel(element);
  if (preceding) return preceding;

  const group = element.closest(".form-group, .field, .input-group, .mb-3, .form-field, fieldset");
  if (group) {
    const labels = Array.from(group.querySelectorAll(LABEL_SELECTOR));
    let closestLabel: Element | null = null;

    for (const label of labels) {
      if ((label.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0) {
        closestLabel = label;
      }
    }

    if (closestLabel?.textContent) return closestLabel.textContent.trim();
  }

  return null;
}

export function findNearbyText(element: HTMLElement): string | null {
  const previous = element.previousElementSibling;
  if (previous?.textContent && previous.textContent.trim().length < 80) {
    return previous.textContent.trim();
  }

  const parent = element.parentElement;
  if (parent) {
    for (const child of Array.from(parent.children)) {
      if (child === element) break;
      if (
        child.textContent &&
        child.textContent.trim().length < 80 &&
        !child.querySelector("input, select, textarea")
      ) {
        return child.textContent.trim();
      }
    }
  }

  return null;
}

export function getFieldContextText(element: HTMLElement): string {
  return getElementSignals(element).join(" ");
}

export function inferFieldTypeFromAttributes(element: HTMLElement): FieldType | null {
  const parts = [
    element.getAttribute("name"),
    element.getAttribute("id"),
    element.getAttribute("placeholder"),
    element.getAttribute("data-field"),
    element.getAttribute("data-name"),
  ]
    .filter(Boolean)
    .map((value) => normalizeText(value as string));

  const attrs = parts.join(" ");
  if (!attrs) return null;

  if (/\b(no[_\s.\-]?kk|nokk|kartu[_\s]?keluarga)\b/.test(attrs)) return "familyCardNumber";
  if (/\b(no[_\s.\-]?nik|nik)\b/.test(attrs) && !/\bnokk\b/.test(attrs)) return "nik";
  if (/\b(nama[_\s]?(kepala|lengkap|depan|belakang)?|fullname|full[_\s]?name)\b/.test(attrs)) {
    return attrs.includes("depan") ? "firstName" : attrs.includes("belakang") ? "lastName" : "fullName";
  }
  if (/\b(jenis[_\s]?kelamin|gender|kelamin)\b/.test(attrs)) return "gender";
  if (/\b(tanggal[_\s]?lahir|tgl[_\s]?lahir|birthdate|dob)\b/.test(attrs)) return "birthDate";
  if (/\b(kabupaten|kab[_\s]?kota)\b/.test(attrs)) return "city";
  if (/\bkecamatan\b/.test(attrs)) return "kecamatan";
  if (/\b(kelurahan|desa)\b/.test(attrs)) return "kelurahan";
  if (/\balamat\b/.test(attrs)) return "address";
  if (/\b(email|surel)\b/.test(attrs)) return "email";
  if (/\b(hp|telepon|phone|whatsapp)\b/.test(attrs)) return "phone";
  if (/\bpengeluaran\b/.test(attrs)) return "monthlyExpense";

  return null;
}

export function inferFieldTypeFromLabel(label: string | null): FieldType | null {
  if (!label) return null;

  const text = normalizeText(label);
  if (/\b(no[.\s]?kk|kartu keluarga)\b/.test(text)) return "familyCardNumber";
  if (text === "nik" || /\bnomor nik\b/.test(text)) return "nik";
  if (/\bnama kepala\b/.test(text) || /\bnama lengkap\b/.test(text)) return "fullName";
  if (/\bnama depan\b/.test(text)) return "firstName";
  if (/\bnama belakang\b/.test(text)) return "lastName";
  if (/\bnama\b/.test(text)) return "fullName";
  if (/\bjenis kelamin\b/.test(text)) return "gender";
  if (/\btanggal lahir\b/.test(text) || /\btgl lahir\b/.test(text)) return "birthDate";
  if (/\bkabupaten\b/.test(text) || /\bkab\/kota\b/.test(text)) return "city";
  if (/\bkecamatan\b/.test(text)) return "kecamatan";
  if (/\b(kelurahan|desa)\b/.test(text)) return "kelurahan";
  if (/\balamat\b/.test(text)) return "address";
  if (/\bpengeluaran\b/.test(text)) return "monthlyExpense";

  return null;
}
