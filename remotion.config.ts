import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer("angle");

// This environment blocks Remotion's own Chrome Headless Shell download
// (network egress allowlist). A compatible Chromium build is already
// preinstalled for Playwright — reuse it instead of downloading one.
// See TROUBLESHOOTING.md.
const preinstalledHeadlessShell =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (process.env["REMOTION_BROWSER_EXECUTABLE"]) {
  Config.setBrowserExecutable(process.env["REMOTION_BROWSER_EXECUTABLE"]);
} else if (existsSync(preinstalledHeadlessShell)) {
  Config.setBrowserExecutable(preinstalledHeadlessShell);
}
