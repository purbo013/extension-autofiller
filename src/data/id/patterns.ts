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

function districtCodeFromName(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % 99;
  }
  return String(hash + 1).padStart(2, "0");
}

function generate16DigitNumber(): string {
  const digits = [String(Math.floor(Math.random() * 9) + 1)];
  for (let index = 1; index < 16; index += 1) {
    digits.push(String(Math.floor(Math.random() * 10)));
  }
  return digits.join("");
}

export function generateNik(params: {
  province: string;
  city: string;
  kecamatan?: string;
  birthDate: string;
  gender: Gender;
}): string {
  const provinceCode = PROVINCE_NIK_CODES[params.province] ?? "31";
  const cityCode = CITY_NIK_CODES[params.city] ?? "71";
  const districtCode = params.kecamatan
    ? districtCodeFromName(params.kecamatan)
    : String(Math.floor(Math.random() * 99) + 1).padStart(2, "0");
  const [year, month, day] = params.birthDate.split("-").map(Number);
  const yy = String(year).slice(-2);
  const dd = params.gender === "male" ? String(day).padStart(2, "0") : String(day + 40).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  const serial = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `${provinceCode}${cityCode}${districtCode}${dd}${mm}${yy}${serial}`;
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
  return generate16DigitNumber();
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Jakarta Pusat": { lat: -6.1751, lng: 106.8272 },
  "Jakarta Selatan": { lat: -6.2615, lng: 106.8106 },
  "Jakarta Barat": { lat: -6.1683, lng: 106.7588 },
  Bandung: { lat: -6.9175, lng: 107.6191 },
  Bekasi: { lat: -6.2383, lng: 106.9756 },
  Depok: { lat: -6.4025, lng: 106.7942 },
  Semarang: { lat: -6.9667, lng: 110.4167 },
  Surakarta: { lat: -7.5667, lng: 110.8167 },
  Magelang: { lat: -7.4706, lng: 110.2178 },
  Surabaya: { lat: -7.2575, lng: 112.7521 },
  Malang: { lat: -7.9666, lng: 112.6326 },
  Sidoarjo: { lat: -7.4478, lng: 112.7183 },
  Tangerang: { lat: -6.1783, lng: 106.6319 },
  "Tangerang Selatan": { lat: -6.2835, lng: 106.7113 },
  Yogyakarta: { lat: -7.7956, lng: 110.3695 },
  Sleman: { lat: -7.7156, lng: 110.3556 },
  Medan: { lat: 3.5952, lng: 98.6722 },
  Denpasar: { lat: -8.6705, lng: 115.2126 },
  Makassar: { lat: -5.1477, lng: 119.4327 },
  Samarinda: { lat: -0.5022, lng: 117.1536 },
  Balikpapan: { lat: -1.2379, lng: 116.8529 },
};

export function generateCoordinates(city: string): { latitude: string; longitude: string } {
  const base = CITY_COORDINATES[city] ?? { lat: -2.5489, lng: 118.0149 };
  const latitude = base.lat + (Math.random() - 0.5) * 0.05;
  const longitude = base.lng + (Math.random() - 0.5) * 0.05;

  return {
    latitude: latitude.toFixed(6),
    longitude: longitude.toFixed(6),
  };
}
