import type { FieldType } from "../generators/types";
import { normalizeText } from "../shared/utils";

const LABEL_SELECTOR =
  "label, legend, .label, .form-label, .control-label, th, .v-label, mat-label, [class*='form-label'], .bgi-field-label";

export function getElementSignals(element: HTMLElement): string[] {
  const signals: string[] = [];
  const attrs = ["name", "id", "placeholder", "aria-label", "autocomplete", "data-field", "data-name", "title", "label"];

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
  } else if (element.tagName.toLowerCase() === "multiselect" || element.classList.contains("multiselect")) {
    signals.push("select", "multiselect");
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

  const bgiGroup = element.closest(".form-group");
  if (bgiGroup) {
    const bgiLabel = bgiGroup.querySelector(".bgi-field-label");
    if (bgiLabel?.textContent) return bgiLabel.textContent.trim();
  }

  const preceding = findPrecedingLabel(element);
  if (preceding) return preceding;

  const group = element.closest(".form-group, .field, .input-group, .mb-3, .form-field, fieldset, .bgi-input-wrap");
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
    element.getAttribute("label"),
  ]
    .filter(Boolean)
    .map((value) => normalizeText(value as string));

  const attrs = parts.join(" ");
  if (!attrs) return null;

  if (/\b(latitude|lintang)\b/.test(attrs) || attrs === "lat" || /\blat\b/.test(attrs)) return "latitude";
  if (/\b(longitude|bujur)\b/.test(attrs) || attrs === "lng" || attrs === "lon" || /\b(lng|lon)\b/.test(attrs)) {
    return "longitude";
  }
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
  if (
    /\b(aktivitas|kegiatan bantuan|nama kegiatan|nama kegiatan bantuan|kelompok)\b/.test(attrs) ||
    /\bkegiatan bantuan\b/.test(attrs)
  ) {
    return "activityName";
  }
  if (/\b(lokasi|location|detail[_\s]?lokasi|desa lokasi)\b/.test(attrs)) return "location";
  if (/\b(sumber dana|dana bantuan)\b/.test(attrs)) return "genericSelect";
  if (/\b(program bantuan|jenis bantuan)\b/.test(attrs)) return "genericSelect";
  if (/\bopd\b/.test(attrs)) return "genericSelect";
  if (/\b(nominal|jumlah bantuan)\b/.test(attrs)) return "monthlyExpense";
  if (/\btahun\b/.test(attrs) && !/\btahun lahir\b/.test(attrs)) return "genericSelect";
  if (/\bbulan\b/.test(attrs) && !/\bbulan lahir\b/.test(attrs)) return "genericSelect";
  if (/\bvisi\b/.test(attrs)) return "programVision";
  if (/\bmisi\b/.test(attrs)) return "programMission";
  if (/\btujuan\b/.test(attrs)) return "programGoal";
  if (/\bkode pos\b/.test(attrs) || /\bkodepos\b/.test(attrs)) return "postalCode";
  if (/\bkode\b/.test(attrs)) return "programCode";

  return null;
}

export function inferFieldTypeFromLabel(label: string | null): FieldType | null {
  if (!label) return null;

  const text = normalizeText(label);
  if (/\b(latitude|lintang)\b/.test(text) || text === "lat") return "latitude";
  if (/\b(longitude|bujur)\b/.test(text) || text === "lng" || text === "lon") return "longitude";
  if (/\b(no[.\s]?kk|kartu keluarga)\b/.test(text)) return "familyCardNumber";
  if (text === "nik" || /\bnomor nik\b/.test(text)) return "nik";
  if (/\baktivitas\b/.test(text)) return "activityName";
  if (/\b(program bantuan|jenis bantuan)\b/.test(text)) return "genericSelect";
  if (/\b(sumber dana|dana bantuan)\b/.test(text)) return "genericSelect";
  if (text === "opd" || /\bopd\b/.test(text)) return "genericSelect";
  if (/\b(nominal|jumlah)\b/.test(text)) return "monthlyExpense";
  if (text === "tahun" || (/\btahun\b/.test(text) && !/\blahir\b/.test(text))) return "genericSelect";
  if (text === "bulan" || (/\bbulan\b/.test(text) && !/\blahir\b/.test(text))) return "genericSelect";
  if (/\b(lokasi|location|detail lokasi)\b/.test(text)) return "location";
  if (/\bvisi\b/.test(text)) return "programVision";
  if (/\bmisi\b/.test(text)) return "programMission";
  if (/\btujuan\b/.test(text)) return "programGoal";
  if (/\bkode pos\b/.test(text) || /\bkodepos\b/.test(text)) return "postalCode";
  if (text === "kode" || /\bkode\b/.test(text)) return "programCode";
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
