import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./styles.css";
import "./curriculum.css";
import "./username-login.css";
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
