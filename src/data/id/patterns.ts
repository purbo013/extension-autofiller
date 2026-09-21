import type { Gender } from "../../generators/types";

export const PROVINCE_NIK_CODES: Record<string, string> = {
  "DKI Jakarta": "31",
  "Jawa Barat": "32",
  "Jawa Tengah": "33",
  "Jawa Timur": "35",
  Banten: "36",
  "DI Yogyakarta": "34",
  "Sumatera Utara": "12",
  Bali: "51",
  "Sulawesi Selatan": "73",
  "Kalimantan Timur": "64",
};

export const CITY_NIK_CODES: Record<string, string> = {
  "Jakarta Pusat": "71",
  "Jakarta Selatan": "74",
  "Jakarta Barat": "73",
  Bandung: "73",
  Bekasi: "75",
  Depok: "76",
  Semarang: "74",
  Surakarta: "72",
  Magelang: "71",
  Surabaya: "78",
  Malang: "77",
  Sidoarjo: "79",
  Tangerang: "71",
  "Tangerang Selatan": "72",
  Yogyakarta: "71",
  Sleman: "74",
  Medan: "71",
  Denpasar: "71",
  Makassar: "71",
  Samarinda: "71",
  Balikpapan: "71",
};

export function generateNik(params: {
  province: string;
  city: string;
  birthDate: string;
  gender: Gender;
}): string {
  const provinceCode = PROVINCE_NIK_CODES[params.province] ?? "31";
  const cityCode = CITY_NIK_CODES[params.city] ?? "71";
  const [year, month, day] = params.birthDate.split("-").map(Number);
  const yy = String(year).slice(-2);
  const dd = params.gender === "male" ? String(day).padStart(2, "0") : String(day + 40).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  const serial = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${provinceCode}${cityCode}${dd}${mm}${yy}${serial}`;
}

export function generateNpwp(): string {
  const part1 = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  const part2 = String(Math.floor(Math.random() * 1_000_000_000)).padStart(9, "0");
  const part3 = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `${part1}.${part2}.${part3}-000.000`;
}

export function generateBankAccount(): string {
  const length = Math.random() > 0.5 ? 10 : 13;
  return String(Math.floor(Math.random() * 10 ** length)).padStart(length, "0");
}

export function generateFamilyCardNumber(): string {
  return String(Math.floor(Math.random() * 9_000_000_000_000_000) + 1_000_000_000_000_000);
}
