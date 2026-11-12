import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import android from "./android-package.json" with { type: "json" };

function androidDownloads() {
  const links = JSON.stringify([{
    relation: ["delegate_permission/common.handle_all_urls"],
    target: { namespace: "android_app", package_name: android.package, sha256_cert_fingerprints: [android.certificate] },
  }], null, 2) + "\n";
  const apk = new URL("./nlereviewer.apk", import.meta.url);
  return {
    name: "android-downloads",
    async closeBundle() {
      const binary = await readFile(apk);
      if (createHash("sha256").update(binary).digest("hex") !== android.sha256) throw Error("The Android download does not match its signed release.");
      await Promise.all([mkdir("dist/downloads", { recursive: true }), mkdir("dist/.well-known", { recursive: true })]);
      await Promise.all([writeFile("dist/downloads/nlereviewer.apk", binary), writeFile("dist/.well-known/assetlinks.json", links)]);
    },
  };
}

export default defineConfig({ plugins: [react(), androidDownloads()], server: { port: 5173, strictPort: true }, build: { target: "es2022" } });
