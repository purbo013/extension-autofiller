import type { FieldType, IndonesianProfile } from "../generators/types";
import { normalizeText } from "../shared/utils";
import {
  findLabelText,
  getElementSignals,
  inferFieldTypeFromAttributes,
  inferFieldTypeFromLabel,
} from "./label-utils";

interface FieldRule {
  type: FieldType;
  keywords: string[];
  autocomplete: string[];
  inputTypes: string[];
  weight: number;
}

const FIELD_RULES: FieldRule[] = [
  {
    type: "familyCardNumber",
    keywords: ["no kk", "no.kk", "no_kk", "nokk", "nomor kk", "kartu keluarga", "family card"],
    autocomplete: [],
    inputTypes: ["text", "number"],
    weight: 10,
  },
  {
    type: "fullName",
    keywords: [
      "nama lengkap",
      "nama kepala",
      "kepala keluarga",
      "fullname",
      "full name",
      "full_name",
      "namalengkap",
      "nama peserta",
    ],
    autocomplete: ["name", "fullname"],
    inputTypes: ["text"],
    weight: 8,
  },
  {
    type: "firstName",
    keywords: ["nama depan", "firstname", "first name", "first_name", "givenname", "given name"],
    autocomplete: ["given-name", "fname"],
    inputTypes: ["text"],
    weight: 5,
  },
  {
    type: "lastName",
    keywords: ["nama belakang", "lastname", "last name", "last_name", "surname", "familyname"],
    autocomplete: ["family-name", "lname"],
    inputTypes: ["text"],
    weight: 5,
  },
  {
    type: "latitude",
    keywords: ["latitude", "lintang", "koordinat lat", "coord lat", "lat"],
    autocomplete: [],
    inputTypes: ["text", "number"],
    weight: 12,
  },
  {
    type: "longitude",
    keywords: ["longitude", "bujur", "koordinat lng", "coord lng", "lng", "lon"],
    autocomplete: [],
    inputTypes: ["text", "number"],
    weight: 12,
  },
  {
    type: "nik",
    keywords: ["nik", "nomor induk kependudukan", "no nik", "no_nik", "ktp"],
    autocomplete: [],
    inputTypes: ["text", "number"],
    weight: 10,
  },
  {
    type: "gender",
    keywords: ["jenis kelamin", "gender", "kelamin", "sex"],
    autocomplete: ["sex"],
    inputTypes: ["text", "radio", "select-one", "select"],
    weight: 8,
  },
  {
    type: "birthDate",
    keywords: ["tanggal lahir", "tgl lahir", "tgl_lahir", "birthdate", "birth date", "dob", "date of birth"],
    autocomplete: ["bday", "birthday"],
    inputTypes: ["date", "text", "number"],
    weight: 8,
  },
  {
    type: "province",
    keywords: ["provinsi", "province", "propinsi"],
    autocomplete: ["address-level1"],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "city",
    keywords: ["kabupaten", "kab/kota", "kab kota", "regency"],
    autocomplete: ["address-level2"],
    inputTypes: ["text", "select-one", "select"],
    weight: 9,
  },
  {
    type: "city",
    keywords: ["kota", "city"],
    autocomplete: ["address-level2"],
    inputTypes: ["text", "select-one", "select"],
    weight: 7,
  },
  {
    type: "kecamatan",
    keywords: ["kecamatan", "kec", "subdistrict", "district"],
    autocomplete: ["address-level3"],
    inputTypes: ["text", "select-one", "select"],
    weight: 9,
  },
  {
    type: "kelurahan",
    keywords: ["kelurahan", "desa", "kel", "village", "suburb"],
    autocomplete: ["address-level4"],
    inputTypes: ["text", "select-one", "select"],
    weight: 9,
  },
  {
    type: "address",
    keywords: ["alamat lengkap", "full address", "detail alamat"],
    autocomplete: ["address-line1", "address-line2", "street-address"],
    inputTypes: ["text", "textarea"],
    weight: 7,
  },
  {
    type: "street",
    keywords: ["jalan", "nama jalan", "street", "street name"],
    autocomplete: ["street-address", "address-line1"],
    inputTypes: ["text"],
    weight: 6,
  },
  {
    type: "address",
    keywords: ["alamat", "address"],
    autocomplete: [],
    inputTypes: ["text", "textarea"],
    weight: 9,
  },
  {
    type: "email",
    keywords: ["email", "e-mail", "surel", "alamat email"],
    autocomplete: ["email"],
    inputTypes: ["email"],
    weight: 10,
  },
  {
    type: "phone",
    keywords: ["telepon", "telp", "hp", "handphone", "no hp", "no_telp", "notelp", "whatsapp", "wa", "ponsel", "mobile"],
    autocomplete: ["tel", "mobile", "tel-national"],
    inputTypes: ["tel", "text", "number"],
    weight: 8,
  },
  {
    type: "monthlyExpense",
    keywords: ["pengeluaran", "pengeluaran bulanan", "biaya bulanan", "expense"],
    autocomplete: [],
    inputTypes: ["text", "number"],
    weight: 8,
  },
  {
    type: "savings",
    keywords: ["ada simpanan", "simpanan", "tabungan"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "decile",
    keywords: ["desil", "decile"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select", "number"],
    weight: 8,
  },
  {
    type: "capilMatch",
    keywords: ["padan capil", "padan dukcapil", "capil"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "stunting",
    keywords: ["stunting"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "houseOwnership",
    keywords: ["kepemilikan rumah", "status rumah", "kepemilikan"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "roof",
    keywords: ["atap"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "wall",
    keywords: ["dinding"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "floor",
    keywords: ["lantai"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "lighting",
    keywords: ["penerangan"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "fuel",
    keywords: ["bbm", "bahan bakar"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "water",
    keywords: ["air minum"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "toilet",
    keywords: ["fasilitas bab", "fasilitas buang air", "jamban", "toilet"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 8,
  },
  {
    type: "assets",
    keywords: ["aset"],
    autocomplete: [],
    inputTypes: ["text", "textarea"],
    weight: 8,
  },
  {
    type: "facilities",
    keywords: ["sarana", "prasarana", "sarana dan prasarana"],
    autocomplete: [],
    inputTypes: ["text", "textarea"],
    weight: 8,
  },
  {
    type: "npwp",
    keywords: ["npwp", "nomor pokok wajib pajak", "no npwp"],
    autocomplete: [],
    inputTypes: ["text", "number"],
    weight: 9,
  },
  {
    type: "birthPlace",
    keywords: ["tempat lahir", "tempat_lahir", "birthplace", "birth place", "kota lahir"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 7,
  },
  {
    type: "postalCode",
    keywords: ["kode pos", "kodepos", "postal", "zip", "zipcode"],
    autocomplete: ["postal-code"],
    inputTypes: ["text", "number"],
    weight: 8,
  },
  {
    type: "rt",
    keywords: ["rt", "nomor rt", "no rt"],
    autocomplete: [],
    inputTypes: ["text", "number"],
    weight: 8,
  },
  {
    type: "rw",
    keywords: ["rw", "nomor rw", "no rw"],
    autocomplete: [],
    inputTypes: ["text", "number"],
    weight: 8,
  },
  {
    type: "religion",
    keywords: ["agama", "religion"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select", "radio"],
    weight: 7,
  },
  {
    type: "occupation",
    keywords: ["pekerjaan", "jabatan", "occupation", "profesi", "job"],
    autocomplete: ["organization-title"],
    inputTypes: ["text", "select-one", "select"],
    weight: 6,
  },
  {
    type: "company",
    keywords: ["perusahaan", "company", "instansi", "nama perusahaan", "employer"],
    autocomplete: ["organization"],
    inputTypes: ["text"],
    weight: 6,
  },
  {
    type: "education",
    keywords: ["pendidikan", "education", "jurusan", "pendidikan terakhir", "degree"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 6,
  },
  {
    type: "maritalStatus",
    keywords: ["status pernikahan", "status kawin", "marital", "pernikahan", "kawin"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select", "radio"],
    weight: 7,
  },
  {
    type: "bankAccount",
    keywords: ["nomor rekening", "no rekening", "norek", "bank account", "account number", "rekening"],
    autocomplete: [],
    inputTypes: ["text", "number"],
    weight: 8,
  },
  {
    type: "bankName",
    keywords: ["nama bank", "bank", "bank name"],
    autocomplete: [],
    inputTypes: ["text", "select-one", "select"],
    weight: 7,
  },
];

function getInputType(element: HTMLElement): string {
  if (element instanceof HTMLInputElement) return element.type;
  if (element instanceof HTMLSelectElement) return "select";
  if (element instanceof HTMLTextAreaElement) return "textarea";
  if (element.tagName.toLowerCase() === "multiselect" || element.classList.contains("multiselect")) {
    return "select";
  }
  return element.tagName.toLowerCase();
}

function inputTypeMatchesRule(inputType: string, ruleInputTypes: string[]): boolean {
  if (ruleInputTypes.includes(inputType)) return true;
  if (inputType === "textarea" && ruleInputTypes.includes("text")) return true;
  if (inputType === "select" && ruleInputTypes.some((type) => type === "select" || type === "select-one")) {
    return true;
  }
  return false;
}

function scoreRule(rule: FieldRule, signals: string[], element: HTMLElement): number {
  let score = 0;
  const normalizedSignals = normalizeText(signals.join(" "));
  const autocomplete = normalizeText(element.getAttribute("autocomplete") ?? "");
  const inputType = getInputType(element);

  for (const keyword of rule.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedSignals.includes(normalizedKeyword)) {
      score += rule.weight;
    }
  }

  for (const auto of rule.autocomplete) {
    if (autocomplete === normalizeText(auto) || autocomplete.includes(normalizeText(auto))) {
      score += rule.weight + 2;
    }
  }

  if (rule.inputTypes.includes(inputType)) {
    score += 2;
  }

  if (rule.type === "firstName" && normalizedSignals.includes("nama") && !normalizedSignals.includes("belakang") && !normalizedSignals.includes("lengkap") && !normalizedSignals.includes("kepala")) {
    score += 2;
  }

  if (rule.type === "fullName" && normalizedSignals.includes("nama kepala")) {
    score += 6;
  }

  if (
    (rule.type === "nik" || rule.type === "familyCardNumber") &&
    /\b(latitude|longitude|lintang|bujur|lat|lng|lon)\b/.test(normalizedSignals)
  ) {
    return 0;
  }

  if (rule.type === "latitude" && /\b(latitude|lintang)\b/.test(normalizedSignals)) {
    score += 4;
  }

  if (rule.type === "longitude" && /\b(longitude|bujur)\b/.test(normalizedSignals)) {
    score += 4;
  }

  if (rule.type === "nik" && normalizedSignals.includes("nik") && !normalizedSignals.includes("nokk")) {
    score += 3;
  }

  if (rule.type === "email" && !normalizedSignals.includes("email") && !normalizedSignals.includes("surel")) {
    score = 0;
  }

  if (rule.type === "birthDate" && !normalizedSignals.includes("lahir") && !normalizedSignals.includes("birth") && !normalizedSignals.includes("dob")) {
    score = Math.min(score, 1);
  }

  if (score > 0 && !inputTypeMatchesRule(inputType, rule.inputTypes)) {
    return 0;
  }

  return score;
}

export function matchFieldType(element: HTMLElement): { fieldType: FieldType; score: number; signals: string[] } {
  const signals = getElementSignals(element);
  const attrType = inferFieldTypeFromAttributes(element);
  const labelType = inferFieldTypeFromLabel(findLabelText(element));

  if (attrType) {
    return { fieldType: attrType, score: 100, signals };
  }

  if (labelType) {
    return { fieldType: labelType, score: 95, signals };
  }

  const isSelectLike =
    element instanceof HTMLSelectElement ||
    element.tagName.toLowerCase() === "multiselect" ||
    element.classList.contains("multiselect");
  let bestType: FieldType = isSelectLike ? "genericSelect" : "genericText";
  let bestScore = 0;

  for (const rule of FIELD_RULES) {
    const score = scoreRule(rule, signals, element);
    if (score > bestScore) {
      bestScore = score;
      bestType = rule.type;
    }
  }

  if (bestScore === 0) {
    if (isSelectLike) bestType = "genericSelect";
    else if (element instanceof HTMLInputElement && element.type === "number") bestType = "genericNumber";
    else bestType = "genericText";
  }

  return { fieldType: bestType, score: bestScore, signals };
}

export function getProfileValue(fieldType: FieldType, profile: IndonesianProfile): string {
  switch (fieldType) {
    case "firstName":
      return profile.firstName;
    case "lastName":
      return profile.lastName;
    case "fullName":
      return profile.fullName;
    case "email":
      return profile.email;
    case "phone":
      return profile.phone;
    case "nik":
      return profile.nik;
    case "familyCardNumber":
      return profile.familyCardNumber;
    case "npwp":
      return profile.npwp;
    case "birthDate":
      return profile.birthDate;
    case "birthPlace":
      return profile.birthPlace;
    case "province":
      return profile.address.province;
    case "city":
      return profile.address.city;
    case "kecamatan":
      return profile.address.kecamatan;
    case "kelurahan":
      return profile.address.kelurahan;
    case "postalCode":
      return profile.address.postalCode;
    case "street":
      return profile.address.street;
    case "address":
      return `${profile.address.street}, RT ${profile.address.rt}/RW ${profile.address.rw}, ${profile.address.kelurahan}, ${profile.address.kecamatan}, ${profile.address.city}, ${profile.address.province} ${profile.address.postalCode}`;
    case "rt":
      return profile.address.rt;
    case "rw":
      return profile.address.rw;
    case "gender":
      return profile.gender === "male" ? "Laki-laki" : "Perempuan";
    case "religion":
      return profile.religion;
    case "occupation":
      return profile.occupation;
    case "company":
      return profile.company;
    case "education":
      return profile.education;
    case "maritalStatus":
      return profile.maritalStatus;
    case "bankAccount":
      return profile.bankAccount;
    case "bankName":
      return profile.bankName;
    case "monthlyExpense":
      return profile.monthlyExpense;
    case "assets":
      return profile.assets;
    case "facilities":
      return profile.facilities;
    case "houseOwnership":
      return profile.housing.ownership;
    case "roof":
      return profile.housing.roof;
    case "wall":
      return profile.housing.wall;
    case "floor":
      return profile.housing.floor;
    case "lighting":
      return profile.housing.lighting;
    case "fuel":
      return profile.housing.fuel;
    case "water":
      return profile.housing.water;
    case "toilet":
      return profile.housing.toilet;
    case "savings":
      return profile.yesNo.savings;
    case "decile":
      return profile.decile;
    case "capilMatch":
      return profile.yesNo.capilMatch;
    case "stunting":
      return profile.yesNo.stunting;
    case "latitude":
      return profile.latitude;
    case "longitude":
      return profile.longitude;
    default:
      return "";
  }
}
