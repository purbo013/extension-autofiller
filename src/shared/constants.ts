export const MATCH_THRESHOLD = 2;

export const FIELD_FILL_DELAY_MS = 30;

export const CASCADE_FILL_DELAY_MS = 450;

export const GEO_FIELD_ORDER = ["province", "city", "kecamatan", "kelurahan"] as const;

export const SKIP_CHECKBOX_KEYWORDS = [
  "syarat",
  "terms",
  "agree",
  "persetujuan",
  "subscribe",
  "newsletter",
  "captcha",
  "robot",
] as const;

export const MESSAGE_ACTIONS = {
  FILL_FORM: "FILL_FORM",
  GENERATE_PROFILE: "GENERATE_PROFILE",
} as const;
