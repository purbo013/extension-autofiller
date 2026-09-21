import { generateProfile } from "../generators/profile-generator";
import type { FillResult, IndonesianProfile } from "../generators/types";
import { MESSAGE_ACTIONS } from "../shared/constants";
import { delay } from "../shared/utils";
import { countFillableElements, detectCheckboxes, detectFields, detectRadioGroups } from "./field-detector";
import { fillForm } from "./field-filler";

let lastProfile: IndonesianProfile | null = null;

async function handleFillForm(): Promise<FillResult> {
  const profile = generateProfile();
  lastProfile = profile;

  const fields = detectFields();
  const radioGroups = detectRadioGroups();
  const checkboxes = detectCheckboxes();
  const total = countFillableElements();

  let filled = await fillForm(profile, fields, radioGroups, checkboxes);
  await delay(700);
  filled += await fillForm(profile, detectFields(), detectRadioGroups(), detectCheckboxes(), true);
  await delay(500);
  filled += await fillForm(profile, detectFields(), detectRadioGroups(), detectCheckboxes(), true);

  return {
    filled,
    skipped: Math.max(total - filled, 0),
    total,
    profile,
  };
}

function handleGenerateProfile(): IndonesianProfile {
  const profile = generateProfile();
  lastProfile = profile;
  return profile;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.action === MESSAGE_ACTIONS.FILL_FORM) {
    handleFillForm()
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((error: Error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message?.action === MESSAGE_ACTIONS.GENERATE_PROFILE) {
    try {
      const profile = handleGenerateProfile();
      sendResponse({ success: true, profile });
    } catch (error) {
      sendResponse({ success: false, error: (error as Error).message });
    }
    return true;
  }

  if (message?.action === "GET_LAST_PROFILE") {
    sendResponse({ success: true, profile: lastProfile });
    return true;
  }

  return false;
});

export {};
