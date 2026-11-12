import { useState, useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import { Modal } from "./ui";

type InstallPrompt = Event & {
  prompt(): Promise<unknown>;
  userChoice: Promise<unknown>;
};

const standalone = window.matchMedia("(display-mode: standalone)");
const androidDevice = /Android/i.test(navigator.userAgent);
const appleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
const androidDownload = "/downloads/nlereviewer.apk";
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
  return installedInBrowser || standalone.matches || /^android-app:\/\/app\.vercel\.nlereviewer(?:\/|$)/.test(document.referrer) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
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
  if (appleMobile) return <ol className="install-app-steps">
    <li>In Safari, tap <strong>Share</strong>. If it’s under <strong>More</strong>, open that menu first.</li>
    <li>Choose <strong>Add to Home Screen</strong>.</li>
    <li>Turn on <strong>Open as Web App</strong> if it appears, then tap <strong>Add</strong>.</li>
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

  if (androidDevice) return <a className="btn install-app-button" href={androidDownload} download="NLEReviewer.apk" aria-label="Download NLEReviewer for Android">
    <Download size={16} aria-hidden="true"/>Install App
  </a>;

  return <>
    <button type="button" className="btn install-app-button" aria-haspopup="dialog" disabled={prompting} onClick={() => setShowGuide(true)}>
      <Download size={16} aria-hidden="true"/>Install App
    </button>
    {showGuide && <Modal title="Install NLEReviewer" onClose={() => setShowGuide(false)}>
      {!appleMobile && <div className="button-row">
        <a className="btn primary" href={androidDownload} download="NLEReviewer.apk"><Download size={16} aria-hidden="true"/>Download Android app</a>
        {installPrompt && <button type="button" className="btn" disabled={prompting} onClick={() => void install()}>Install on this device</button>}
      </div>}
      {(appleMobile || !installPrompt) && <InstallSteps/>}
      <p>Open NLEReviewer from its new icon. Sign in, then turn on <strong>Push reminders</strong> under <strong>Play</strong> to receive alerts.</p>
    </Modal>}
  </>;
}
