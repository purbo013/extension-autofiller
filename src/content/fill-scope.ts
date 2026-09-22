import { isVisible } from "../shared/utils";

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

function isFormControl(element: Element): boolean {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  );
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

function getContainerFromElement(element: HTMLElement): HTMLElement | null {
  const modal = element.closest<HTMLElement>(MODAL_SELECTORS);
  if (modal && isActiveModal(modal)) return modal;

  const form = element.closest<HTMLFormElement>("form");
  if (form && isVisible(form) && !isInHiddenTree(form)) return form;

  const wrapper = element.closest<HTMLElement>(FORM_WRAPPER_SELECTORS);
  if (wrapper && isVisible(wrapper) && !isInHiddenTree(wrapper)) return wrapper;

  return null;
}

function getVisibleForms(): HTMLFormElement[] {
  return Array.from(document.querySelectorAll<HTMLFormElement>("form")).filter(
    (form) => isVisible(form) && !isInHiddenTree(form),
  );
}

export function resolveFillRoot(): ParentNode {
  const active = document.activeElement;
  const modal = findTopmostModal();

  if (modal) {
    return modal;
  }

  if (active instanceof HTMLElement && active !== document.body && active !== document.documentElement) {
    if (isFormControl(active) || active.isContentEditable) {
      const container = getContainerFromElement(active);
      if (container) return container;
    }
  }

  const visibleForms = getVisibleForms();
  if (visibleForms.length === 1) {
    return visibleForms[0];
  }

  throw new Error(
    "Tidak ada form/modal aktif. Klik field di form yang ingin diisi, lalu coba lagi.",
  );
}
