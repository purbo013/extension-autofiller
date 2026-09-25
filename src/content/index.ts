import { generateProfile } from "../generators/profile-generator";
import type { FillResult, IndonesianProfile } from "../generators/types";
import { MESSAGE_ACTIONS, WIZARD_MAX_STEPS } from "../shared/constants";
import { delay } from "../shared/utils";
import { countFillableElements, detectCheckboxes, detectFields, detectRadioGroups } from "./field-detector";
import { fillForm } from "./field-filler";
import { resolveFillRoot } from "./fill-scope";
import { tryAdvanceToNextStep } from "./next-step";

let lastProfile: IndonesianProfile | null = null;

async function runFillPasses(profile: IndonesianProfile, root: ParentNode): Promise<number> {
  let filled = await fillForm(
    profile,
    detectFields(root),
    detectRadioGroups(root),
    detectCheckboxes(root),
  );
  await delay(700);
  filled += await fillForm(
    profile,
    detectFields(root),
    detectRadioGroups(root),
    detectCheckboxes(root),
    true,
  );
  await delay(500);
  filled += await fillForm(
    profile,
    detectFields(root),
    detectRadioGroups(root),
    detectCheckboxes(root),
    true,
  );
  return filled;
}

async function handleFillForm(): Promise<FillResult> {
  const profile = generateProfile();
  lastProfile = profile;

  const root = resolveFillRoot();
  let filled = 0;
  let total = 0;
  let wizardSteps = 0;

  for (let step = 0; step < WIZARD_MAX_STEPS; step += 1) {
    total += countFillableElements(root);
    filled += await runFillPasses(profile, root);

    const advanced = await tryAdvanceToNextStep(root);
    if (!advanced) break;
    wizardSteps += 1;
  }

  return {
    filled,
    skipped: Math.max(total - filled, 0),
    total,
    profile,
    wizardSteps: wizardSteps > 0 ? wizardSteps : undefined,
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
