import type { FieldType, IndonesianProfile } from "../generators/types";

const GENDER_CANDIDATES: Record<"male" | "female", string[]> = {
  male: ["Laki-laki", "Laki Laki", "Laki-Laki", "Pria", "Laki", "Male", "M", "L"],
  female: ["Perempuan", "Wanita", "Female", "F", "P"],
};

export function getSelectTargetValues(fieldType: FieldType, profile: IndonesianProfile, value: string): string[] {
  if (fieldType === "gender") {
    return GENDER_CANDIDATES[profile.gender];
  }
  return [value];
}
