export const MATCH_THRESHOLD = 2;

export const FIELD_FILL_DELAY_MS = 30;

export const CASCADE_FILL_DELAY_MS = 450;

export const WIZARD_MAX_STEPS = 10;

export const NEXT_STEP_AFTER_CLICK_MS = 600;

export const NEXT_STEP_TRANSITION_MS = 3500;

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
  FILL_FORM_MODAL: "FILL_FORM_MODAL",
  FILL_FORM_MODULE: "FILL_FORM_MODULE",
  GENERATE_PROFILE: "GENERATE_PROFILE",
} as const;
