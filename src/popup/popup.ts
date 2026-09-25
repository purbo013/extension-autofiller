import type { IndonesianProfile } from "../generators/types";
import { MESSAGE_ACTIONS } from "../shared/constants";
import { sendToActiveTab } from "../shared/messaging";

interface MessageResponse {
  success: boolean;
  filled?: number;
  skipped?: number;
  total?: number;
  wizardSteps?: number;
  profile?: IndonesianProfile;
  error?: string;
}

const fillModalBtn = document.getElementById("fillModalBtn") as HTMLButtonElement;
const fillModuleBtn = document.getElementById("fillModuleBtn") as HTMLButtonElement;
const generateBtn = document.getElementById("generateBtn") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;
const profilePreview = document.getElementById("profilePreview") as HTMLElement;
const previewName = document.getElementById("previewName") as HTMLElement;
const previewEmail = document.getElementById("previewEmail") as HTMLElement;
const previewPhone = document.getElementById("previewPhone") as HTMLElement;
const previewCity = document.getElementById("previewCity") as HTMLElement;
const previewNik = document.getElementById("previewNik") as HTMLElement;
const footerVersion = document.getElementById("footerVersion") as HTMLElement;

const actionButtons = [fillModalBtn, fillModuleBtn, generateBtn];

function setButtonsDisabled(disabled: boolean): void {
  for (const button of actionButtons) {
    button.disabled = disabled;
  }
}

function setStatus(message: string, type: "default" | "success" | "error" = "default"): void {
  statusEl.textContent = message;
  statusEl.className = `status${type === "success" ? " success" : ""}${type === "error" ? " error" : ""}`;
}

function renderProfile(profile: IndonesianProfile): void {
  profilePreview.classList.remove("hidden");
  previewName.textContent = profile.fullName;
  previewEmail.textContent = profile.email;
  previewPhone.textContent = profile.phone;
  previewCity.textContent = `${profile.address.city}, ${profile.address.province}`;
  previewNik.textContent = profile.nik;
}

function formatFillStatus(response: MessageResponse): string {
  const wizardNote =
    (response.wizardSteps ?? 0) > 0 ? `, ${response.wizardSteps} langkah form dilanjutkan` : "";
  return `${response.filled ?? 0} dari ${response.total ?? response.filled ?? 0} field terisi${(response.skipped ?? 0) > 0 ? `, ${response.skipped} dilewati` : ""}${wizardNote}.`;
}

async function runFill(action: string, loadingMessage: string): Promise<void> {
  setButtonsDisabled(true);
  setStatus(loadingMessage);

  try {
    const response = await sendToActiveTab<MessageResponse>(action);
    if (!response.success || !response.profile) {
      throw new Error(response.error ?? "Gagal mengisi form.");
    }

    renderProfile(response.profile);
    setStatus(formatFillStatus(response), "success");
    await chrome.storage.local.set({ lastProfile: response.profile });
  } catch (error) {
    setStatus((error as Error).message, "error");
  } finally {
    setButtonsDisabled(false);
  }
}

async function generateProfileOnly(): Promise<void> {
  setButtonsDisabled(true);
  setStatus("Membuat profil acak baru...");

  try {
    const response = await sendToActiveTab<MessageResponse>(MESSAGE_ACTIONS.GENERATE_PROFILE);
    if (!response.success || !response.profile) {
      throw new Error(response.error ?? "Gagal membuat profil.");
    }

    renderProfile(response.profile);
    setStatus("Data acak baru siap dipakai.", "success");
    await chrome.storage.local.set({ lastProfile: response.profile });
  } catch (error) {
    setStatus((error as Error).message, "error");
  } finally {
    setButtonsDisabled(false);
  }
}

async function loadStoredProfile(): Promise<void> {
  const stored = await chrome.storage.local.get("lastProfile");
  if (stored.lastProfile) {
    renderProfile(stored.lastProfile as IndonesianProfile);
  }
}

fillModalBtn.addEventListener("click", () => {
  void runFill(MESSAGE_ACTIONS.FILL_FORM_MODAL, "Mengisi form di modal...");
});

fillModuleBtn.addEventListener("click", () => {
  void runFill(MESSAGE_ACTIONS.FILL_FORM_MODULE, "Mengisi form modul di halaman...");
});

generateBtn.addEventListener("click", () => {
  void generateProfileOnly();
});

footerVersion.textContent = `v${chrome.runtime.getManifest().version}`;

void loadStoredProfile();
