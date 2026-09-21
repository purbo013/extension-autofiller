import { MESSAGE_ACTIONS } from "../shared/constants";
import { sendToActiveTab } from "../shared/messaging";

async function fillActiveTab(): Promise<void> {
  try {
    await sendToActiveTab(MESSAGE_ACTIONS.FILL_FORM);
  } catch {
    // Ignore tabs where content scripts cannot run (chrome://, etc.)
  }
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "fill-form") {
    void fillActiveTab();
  }
});

export {};
