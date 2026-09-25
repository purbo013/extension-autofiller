import type { FieldType, IndonesianProfile } from "../generators/types";
import { randomInt } from "../shared/utils";

const PLANNING_FIELD_TYPES: FieldType[] = [
  "programVision",
  "programMission",
  "programGoal",
  "programCode",
];

export function isPlanningFieldType(fieldType: FieldType): boolean {
  return PLANNING_FIELD_TYPES.includes(fieldType);
}

export function inferPlanningFieldTypeFromContext(context: string): FieldType | null {
  const text = context.toLowerCase();
  if (/\bvisi\b/.test(text)) return "programVision";
  if (/\bmisi\b/.test(text)) return "programMission";
  if (/\btujuan\b/.test(text)) return "programGoal";
  if (/\bkode pos\b/.test(text) || /\bkodepos\b/.test(text)) return null;
  if (/\bkode\b/.test(text)) return "programCode";
  return null;
}

export function getPlanningFieldValue(fieldType: FieldType, profile: IndonesianProfile): string {
  const { city, province, kecamatan, kelurahan } = profile.address;

  switch (fieldType) {
    case "programVision":
      return `Terwujudnya ${city} yang maju, sejahtera, mandiri, dan berkelanjutan menuju masyarakat yang adil dan makmur`;
    case "programMission":
      return `Meningkatkan kualitas pelayanan publik, pembangunan infrastruktur, dan sumber daya manusia di ${kecamatan}, ${city}`;
    case "programGoal":
      return `Meningkatkan kesejahteraan dan daya saing masyarakat ${kelurahan}, ${kecamatan}, ${province}`;
    case "programCode":
      return `${String(randomInt(10, 99))}.${String(randomInt(100, 999))}.${String(randomInt(1, 9))}`;
    default:
      return "";
  }
}
