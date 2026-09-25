export type Gender = "male" | "female";

export interface IndonesianAddress {
  street: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface IndonesianProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  gender: Gender;
  birthDate: string;
  birthPlace: string;
  email: string;
  phone: string;
  phoneIntl: string;
  nik: string;
  familyCardNumber: string;
  npwp: string;
  address: IndonesianAddress;
  occupation: string;
  company: string;
  education: string;
  religion: string;
  maritalStatus: string;
  bankAccount: string;
  bankName: string;
  monthlyExpense: string;
  assets: string;
  facilities: string;
  housing: {
    ownership: string;
    roof: string;
    wall: string;
    floor: string;
    lighting: string;
    fuel: string;
    water: string;
    toilet: string;
  };
  yesNo: {
    savings: string;
    capilMatch: string;
    stunting: string;
  };
  decile: string;
  latitude: string;
  longitude: string;
}

export type FieldType =
  | "firstName"
  | "lastName"
  | "fullName"
  | "email"
  | "phone"
  | "nik"
  | "familyCardNumber"
  | "npwp"
  | "birthDate"
  | "birthPlace"
  | "province"
  | "city"
  | "kecamatan"
  | "kelurahan"
  | "postalCode"
  | "address"
  | "street"
  | "rt"
  | "rw"
  | "gender"
  | "religion"
  | "occupation"
  | "company"
  | "education"
  | "maritalStatus"
  | "bankAccount"
  | "bankName"
  | "monthlyExpense"
  | "assets"
  | "facilities"
  | "houseOwnership"
  | "roof"
  | "wall"
  | "floor"
  | "lighting"
  | "fuel"
  | "water"
  | "toilet"
  | "savings"
  | "decile"
  | "capilMatch"
  | "stunting"
  | "latitude"
  | "longitude"
  | "genericSelect"
  | "genericText"
  | "genericNumber"
  | "genericCheckbox";

export interface DetectedField {
  element: HTMLElement;
  signals: string[];
  fieldType: FieldType;
  score: number;
}

export interface DetectedCheckbox {
  element: HTMLInputElement;
  signals: string[];
  isProgramCheckbox: boolean;
}

export interface FillResult {
  filled: number;
  skipped: number;
  total: number;
  profile: IndonesianProfile;
  wizardSteps?: number;
}
