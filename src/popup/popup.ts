import type { IndonesianProfile } from "../generators/types";
import { MESSAGE_ACTIONS } from "../shared/constants";
import { sendToActiveTab } from "../shared/messaging";

interface MessageResponse {
  success: boolean;
  filled?: number;
  skipped?: number;
  total?: number;
  profile?: IndonesianProfile;
  error?: string;
}

const fillBtn = document.getElementById("fillBtn") as HTMLButtonElement;
const generateBtn = document.getElementById("generateBtn") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;
const profilePreview = document.getElementById("profilePreview") as HTMLElement;
const previewName = document.getElementById("previewName") as HTMLElement;
const previewEmail = document.getElementById("previewEmail") as HTMLElement;
const previewPhone = document.getElementById("previewPhone") as HTMLElement;
const previewCity = document.getElementById("previewCity") as HTMLElement;
const previewNik = document.getElementById("previewNik") as HTMLElement;
const footerVersion = document.getElementById("footerVersion") as HTMLElement;

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

async function fillForm(): Promise<void> {
  fillBtn.disabled = true;
  generateBtn.disabled = true;
  setStatus("Mengisi form...");

  try {
    const response = await sendToActiveTab<MessageResponse>(MESSAGE_ACTIONS.FILL_FORM);
    if (!response.success || !response.profile) {
      throw new Error(response.error ?? "Gagal mengisi form.");
    }

    renderProfile(response.profile);
    setStatus(
      `${response.filled ?? 0} dari ${response.total ?? response.filled ?? 0} field terisi${(response.skipped ?? 0) > 0 ? `, ${response.skipped} dilewati` : ""}.`,
      "success",
    );
    await chrome.storage.local.set({ lastProfile: response.profile });
  } catch (error) {
    setStatus((error as Error).message, "error");
  } finally {
    fillBtn.disabled = false;
    generateBtn.disabled = false;
  }
}

async function generateProfileOnly(): Promise<void> {
  fillBtn.disabled = true;
  generateBtn.disabled = true;
  setStatus("Membuat profil baru...");

  try {
    const response = await sendToActiveTab<MessageResponse>(MESSAGE_ACTIONS.GENERATE_PROFILE);
    if (!response.success || !response.profile) {
      throw new Error(response.error ?? "Gagal membuat profil.");
    }

    renderProfile(response.profile);
    setStatus("Profil baru berhasil dibuat.", "success");
    await chrome.storage.local.set({ lastProfile: response.profile });
  } catch (error) {
    setStatus((error as Error).message, "error");
  } finally {
    fillBtn.disabled = false;
    generateBtn.disabled = false;
  }
}

async function loadStoredProfile(): Promise<void> {
  const stored = await chrome.storage.local.get("lastProfile");
  if (stored.lastProfile) {
    renderProfile(stored.lastProfile as IndonesianProfile);
  }
}

fillBtn.addEventListener("click", () => {
  void fillForm();
});

generateBtn.addEventListener("click", () => {
  void generateProfileOnly();
});

footerVersion.textContent = `v${chrome.runtime.getManifest().version}`;

void loadStoredProfile();
