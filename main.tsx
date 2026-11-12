import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./styles.css";
import "./curriculum.css";
import "./username-login.css";
import "./study-theme.css";
import "./pink-study.css";
import "./notebook-theme.css";
import "./play.css";

window.addEventListener("vite:preloadError", event => {
  if (!navigator.onLine) return;
  const key = "nle-reviewer:last-chunk-reload";
  try {
    const now = Date.now();
    if (now - Number(sessionStorage.getItem(key) || 0) < 30000) return;
    sessionStorage.setItem(key, String(now));
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
