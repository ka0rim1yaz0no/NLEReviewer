import { useState, useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import { Modal } from "./ui";

type InstallPrompt = Event & {
  prompt(): Promise<unknown>;
  userChoice: Promise<unknown>;
};

const standalone = window.matchMedia("(display-mode: standalone)");
let installPrompt: InstallPrompt | undefined;
let installedInBrowser = false;

// Capture the browser's single-use prompt even if it arrives before React mounts.
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event as InstallPrompt;
  installedInBrowser = false;
});

window.addEventListener("appinstalled", () => {
  installPrompt = undefined;
  installedInBrowser = true;
});

function isInstalled() {
  return installedInBrowser || standalone.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function subscribeToInstallation(onChange: () => void) {
  standalone.addEventListener("change", onChange);
  window.addEventListener("beforeinstallprompt", onChange);
  window.addEventListener("appinstalled", onChange);
  return () => {
    standalone.removeEventListener("change", onChange);
    window.removeEventListener("beforeinstallprompt", onChange);
    window.removeEventListener("appinstalled", onChange);
  };
}

function InstallSteps() {
  const appleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (appleMobile) return <ol className="install-app-steps">
    <li>In Safari, tap <strong>Share</strong>. If it’s under <strong>More</strong>, open that menu first.</li>
    <li>Choose <strong>Add to Home Screen</strong>.</li>
    <li>Turn on <strong>Open as Web App</strong> if it appears, then tap <strong>Add</strong>.</li>
  </ol>;

  if (/Android/i.test(navigator.userAgent)) return <ol className="install-app-steps">
    <li>Open this page in Chrome and tap the <strong>three-dot menu</strong>.</li>
    <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
    <li>Tap <strong>Install</strong> to confirm.</li>
  </ol>;

  return <p>Look for <strong>Install</strong> in your browser’s address bar or menu.</p>;
}

export function InstallAppButton() {
  const installed = useSyncExternalStore(subscribeToInstallation, isInstalled);
  const [showGuide, setShowGuide] = useState(false);
  const [prompting, setPrompting] = useState(false);

  async function install() {
    const prompt = installPrompt;
    if (!prompt) {
      setShowGuide(true);
      return;
    }

    installPrompt = undefined;
    setPrompting(true);
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      setShowGuide(true);
    } finally {
      setPrompting(false);
    }
  }

  if (installed) return null;

  return <>
    <button type="button" className="btn install-app-button" aria-haspopup="dialog" disabled={prompting} onClick={() => void install()}>
      <Download size={16} aria-hidden="true"/>Install App
    </button>
    {showGuide && <Modal title="Install NLEReviewer" onClose={() => setShowGuide(false)}>
      <InstallSteps/>
      <p>Open NLEReviewer from its new icon. Sign in, then turn on <strong>Push reminders</strong> under <strong>Play</strong> to receive alerts.</p>
    </Modal>}
  </>;
}
