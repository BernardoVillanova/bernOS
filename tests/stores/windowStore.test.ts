import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useWindowStore } from "../../src/stores/windowStore";

describe("WindowStore Pinia State Management", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with default windows and terminal open", () => {
    const store = useWindowStore();
    const terminal = store.windows.find(w => w.id === "terminal");
    expect(terminal).toBeDefined();
    expect(terminal?.isOpen).toBe(true);

    const vscode = store.windows.find(w => w.id === "vscode");
    expect(vscode).toBeDefined();
    expect(vscode?.isOpen).toBe(false);
  });

  it("should open and close windows correctly", () => {
    const store = useWindowStore();
    store.openWindow("vscode");
    let vscode = store.windows.find(w => w.id === "vscode");
    expect(vscode?.isOpen).toBe(true);
    expect(vscode?.isMinimized).toBe(false);

    store.closeWindow("vscode");
    vscode = store.windows.find(w => w.id === "vscode");
    expect(vscode?.isOpen).toBe(false);
  });

  it("should toggle minimize and restore window state via focus", () => {
    const store = useWindowStore();
    store.openWindow("files");
    let files = store.windows.find(w => w.id === "files");
    expect(files?.isOpen).toBe(true);
    expect(files?.isMinimized).toBe(false);

    store.minimizeWindow("files");
    files = store.windows.find(w => w.id === "files");
    expect(files?.isMinimized).toBe(true);

    store.focusWindow("files");
    files = store.windows.find(w => w.id === "files");
    expect(files?.isMinimized).toBe(false);
  });

  it("should increment zIndex when focusing window", () => {
    const store = useWindowStore();
    store.openWindow("terminal");
    store.openWindow("settings");

    const terminalBefore = store.windows.find(w => w.id === "terminal")?.zIndex ?? 0;
    store.focusWindow("terminal");
    const terminalAfter = store.windows.find(w => w.id === "terminal")?.zIndex ?? 0;

    expect(terminalAfter).toBeGreaterThan(terminalBefore);
  });

  it("should toggle maximize state via toggleMaximizeWindow", () => {
    const store = useWindowStore();
    store.openWindow("mail");
    let mail = store.windows.find(w => w.id === "mail");
    expect(mail?.isMaximized).toBe(false);

    store.toggleMaximizeWindow("mail");
    mail = store.windows.find(w => w.id === "mail");
    expect(mail?.isMaximized).toBe(true);

    store.toggleMaximizeWindow("mail");
    mail = store.windows.find(w => w.id === "mail");
    expect(mail?.isMaximized).toBe(false);
  });
});
