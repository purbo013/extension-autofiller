import { isVisible } from "../shared/utils";

export type FillScopeMode = "auto" | "modal" | "module";

const MODAL_SELECTORS = [
  "dialog[open]",
  "[role='dialog']",
  "[aria-modal='true']",
  ".modal.show",
  ".modal.in",
  ".modal.open",
  ".MuiDialog-root",
  ".MuiModal-root",
  ".ant-modal-wrap",
  ".ant-modal",
  ".el-dialog__wrapper",
  ".el-overlay-dialog",
].join(", ");

const FORM_WRAPPER_SELECTORS = "fieldset, [role='form'], .form-section, .form-container, .ant-form";

const MODULE_SHELL_SELECTORS =
  "main, [role='main'], .module, .content-wrapper, .page-content, .card-body, article";

function isFormControl(element: Element): boolean {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  );
}

function isMultiselectHost(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;
  return element.tagName.toLowerCase() === "multiselect" || element.classList.contains("multiselect");
}

function isInHiddenTree(element: HTMLElement): boolean {
  let node: HTMLElement | null = element;
  while (node) {
    if (node.getAttribute("aria-hidden") === "true") return true;
    const style = window.getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return true;
    node = node.parentElement;
  }
  return false;
}

function getEffectiveZIndex(element: HTMLElement): number {
  let maxZ = 0;
  let node: HTMLElement | null = element;
  while (node && node !== document.body) {
    const zIndex = window.getComputedStyle(node).zIndex;
    if (zIndex !== "auto") {
      const parsed = Number.parseInt(zIndex, 10);
      if (!Number.isNaN(parsed)) maxZ = Math.max(maxZ, parsed);
    }
    node = node.parentElement;
  }
  return maxZ;
}

function isActiveModal(element: HTMLElement): boolean {
  if (!isVisible(element) || isInHiddenTree(element)) return false;
  if (element.tagName === "DIALOG" && !element.hasAttribute("open")) {
    return false;
  }
  return true;
}

function findTopmostModal(): HTMLElement | null {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(MODAL_SELECTORS));
  const visible = candidates.filter(isActiveModal);
  if (visible.length === 0) return null;

  return visible.reduce((best, current) => {
    const bestZ = getEffectiveZIndex(best);
    const currentZ = getEffectiveZIndex(current);
    return currentZ >= bestZ ? current : best;
  });
}

function isInsideActiveModal(element: HTMLElement): boolean {
  const modal = element.closest<HTMLElement>(MODAL_SELECTORS);
  if (!modal) return false;
  return isActiveModal(modal);
}

function getModuleContainerFromElement(element: HTMLElement): HTMLElement | null {
  const form = element.closest<HTMLFormElement>("form");
  if (form && isVisible(form) && !isInHiddenTree(form) && !isInsideActiveModal(form)) {
    return form;
  }

  const wrapper = element.closest<HTMLElement>(FORM_WRAPPER_SELECTORS);
  if (wrapper && isVisible(wrapper) && !isInHiddenTree(wrapper) && !isInsideActiveModal(wrapper)) {
    return wrapper;
  }

  const moduleShell = element.closest<HTMLElement>(MODULE_SHELL_SELECTORS);
  if (
    moduleShell &&
    isVisible(moduleShell) &&
    !isInHiddenTree(moduleShell) &&
    !isInsideActiveModal(moduleShell)
  ) {
    return moduleShell;
  }

  return null;
}

function getVisibleForms(): HTMLFormElement[] {
  return Array.from(document.querySelectorAll<HTMLFormElement>("form")).filter(
    (form) => isVisible(form) && !isInHiddenTree(form),
  );
}

function getVisibleFormsOutsideModal(): HTMLFormElement[] {
  return getVisibleForms().filter((form) => !isInsideActiveModal(form));
}

function resolveFromFocusedField(mode: FillScopeMode): ParentNode | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement) || active === document.body || active === document.documentElement) {
    return null;
  }

  const isFieldTarget =
    isFormControl(active) ||
    active.isContentEditable ||
    isMultiselectHost(active) ||
    Boolean(active.closest("multiselect, .multiselect"));

  if (!isFieldTarget) return null;

  if (mode === "modal") {
    const modal = active.closest<HTMLElement>(MODAL_SELECTORS);
    if (modal && isActiveModal(modal)) return modal;
    return null;
  }

  return getModuleContainerFromElement(active);
}

export function resolveFillRoot(mode: FillScopeMode = "auto"): ParentNode {
  const modal = findTopmostModal();

  if (mode === "modal") {
    if (modal) return modal;
    const focusedModal = resolveFromFocusedField("modal");
    if (focusedModal) return focusedModal;
    throw new Error("Tidak ada modal aktif. Buka dialog/popup form dulu, lalu klik Isi Form Modal.");
  }

  if (mode === "auto" && modal) {
    return modal;
  }

  const focusedModule = resolveFromFocusedField(mode === "module" ? "module" : "module");
  if (focusedModule) return focusedModule;

  const forms = getVisibleFormsOutsideModal();
  if (forms.length === 1) {
    return forms[0];
  }

  if (mode === "module") {
    throw new Error(
      "Tidak ada form modul yang jelas. Klik field di halaman utama (bukan di modal), lalu coba Isi Form Modul.",
    );
  }

  throw new Error(
    "Tidak ada form/modal aktif. Klik field di form yang ingin diisi, lalu coba lagi.",
  );
}
