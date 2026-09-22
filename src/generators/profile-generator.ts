import {
  BANKS,
  COMPANIES,
  EDUCATIONS,
  MARITAL_STATUSES,
  OCCUPATIONS,
  RELIGIONS,
  STREET_NAMES,
} from "../data/id/companies";
import {
  ASSET_SAMPLES,
  DECILE_OPTIONS,
  FACILITY_SAMPLES,
  FLOOR_TYPES,
  FUEL_TYPES,
  HOUSING_OWNERSHIP,
  LIGHTING_TYPES,
  ROOF_TYPES,
  TOILET_TYPES,
  WALL_TYPES,
  WATER_SOURCES,
  YES_NO_OPTIONS,
} from "../data/id/form-options";
import { ALL_CITIES, LOCATIONS } from "../data/id/locations";
import { FEMALE_FIRST_NAMES, LAST_NAMES, MALE_FIRST_NAMES } from "../data/id/names";
import {
  generateBankAccount,
  generateCoordinates,
  generateFamilyCardNumber,
  generateNik,
  generateNpwp,
} from "../data/id/patterns";
import { randomInt, randomPick, slugify } from "../shared/utils";
import type { Gender, IndonesianProfile } from "./types";

function generateBirthDate(): string {
  const today = new Date();
  const age = randomInt(18, 55);
  const birthYear = today.getFullYear() - age;
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return `${birthYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function generatePhone(): { phone: string; phoneIntl: string } {
  const prefixes = ["0812", "0813", "0821", "0822", "0852", "0853", "0857", "0858", "0877", "0878"];
  const prefix = randomPick(prefixes);
  const suffix = String(randomInt(0, 99_999_999)).padStart(8, "0");
  const phone = `${prefix}${suffix}`;
  return {
    phone,
    phoneIntl: `+62${phone.slice(1)}`,
  };
}

function generateEmail(firstName: string, lastName: string, birthDate: string): string {
  const providers = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
  const year = birthDate.slice(2, 4);
  const suffix = randomInt(1, 999);
  const localPart = `${slugify(firstName)}.${slugify(lastName)}${year}${suffix}`;
  return `${localPart}@${randomPick(providers)}`;
}

function generateAddress() {
  const province = randomPick(Object.keys(LOCATIONS));
  const provinceData = LOCATIONS[province];
  const city = randomPick(Object.keys(provinceData.cities));
  const cityData = provinceData.cities[city];
  const kecamatan = randomPick(Object.keys(cityData.kecamatan));
  const kelurahan = randomPick(cityData.kecamatan[kecamatan]);
  const postalCode = randomPick(cityData.postalCodes.length ? cityData.postalCodes : provinceData.postalCodes);
  const streetName = randomPick(STREET_NAMES);
  const streetNumber = randomInt(1, 199);

  return {
    street: `Jl. ${streetName} No. ${streetNumber}`,
    rt: String(randomInt(1, 20)).padStart(3, "0"),
    rw: String(randomInt(1, 15)).padStart(3, "0"),
    kelurahan,
    kecamatan,
    city,
    province,
    postalCode,
  };
}

export function generateProfile(): IndonesianProfile {
  const gender: Gender = Math.random() > 0.5 ? "male" : "female";
  const firstName = randomPick(gender === "male" ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES);
  const lastName = randomPick(LAST_NAMES);
  const fullName = `${firstName} ${lastName}`;
  const birthDate = generateBirthDate();
  const birthPlace = randomPick(ALL_CITIES);
  const address = generateAddress();
  const phoneData = generatePhone();
  const coordinates = generateCoordinates(address.city);

  const profile: IndonesianProfile = {
    firstName,
    lastName,
    fullName,
    gender,
    birthDate,
    birthPlace,
    email: generateEmail(firstName, lastName, birthDate),
    phone: phoneData.phone,
    phoneIntl: phoneData.phoneIntl,
    nik: generateNik({
      province: address.province,
      city: address.city,
      kecamatan: address.kecamatan,
      birthDate,
      gender,
    }),
    familyCardNumber: generateFamilyCardNumber(),
    npwp: generateNpwp(),
    address,
    occupation: randomPick(OCCUPATIONS),
    company: randomPick(COMPANIES),
    education: randomPick(EDUCATIONS),
    religion: randomPick(RELIGIONS),
    maritalStatus: randomPick(MARITAL_STATUSES),
    bankAccount: generateBankAccount(),
    bankName: randomPick(BANKS),
    monthlyExpense: String(randomInt(500_000, 5_000_000)),
    assets: randomPick(ASSET_SAMPLES),
    facilities: randomPick(FACILITY_SAMPLES),
    housing: {
      ownership: randomPick(HOUSING_OWNERSHIP),
      roof: randomPick(ROOF_TYPES),
      wall: randomPick(WALL_TYPES),
      floor: randomPick(FLOOR_TYPES),
      lighting: randomPick(LIGHTING_TYPES),
      fuel: randomPick(FUEL_TYPES),
      water: randomPick(WATER_SOURCES),
      toilet: randomPick(TOILET_TYPES),
    },
    yesNo: {
      savings: randomPick(YES_NO_OPTIONS),
      capilMatch: randomPick(YES_NO_OPTIONS),
      stunting: randomPick(YES_NO_OPTIONS),
    },
    decile: randomPick(DECILE_OPTIONS),
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };

  return profile;
}
