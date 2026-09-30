import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { readLocalSupabaseEnvironment, seedLocalDemo } from "./seed-local-demo.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const playwrightCli = resolve(repositoryRoot, "node_modules", "playwright", "cli.js");

async function run() {
  const { apiUrl, publishableKey } = await readLocalSupabaseEnvironment();
  await seedLocalDemo();

  const child = spawn(process.execPath, [playwrightCli, "test", ...process.argv.slice(2)], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: apiUrl,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      NEXT_PUBLIC_UNIVERSITY_NAME: "Nueva Vizcaya State University Bayombong Campus",
      NEXT_PUBLIC_UNIVERSITY_LATITUDE: "16.479791986946516",
      NEXT_PUBLIC_UNIVERSITY_LONGITUDE: "121.1432206694793",
      PLAYWRIGHT_BROWSERS_PATH: resolve(repositoryRoot, ".playwright-browsers"),
    },
    stdio: "inherit",
    windowsHide: true,
  });

  child.on("error", (error) => {
    process.stderr.write(`Unable to start Playwright: ${error.message}\n`);
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    if (signal) process.stderr.write(`Playwright stopped after receiving ${signal}.\n`);
    process.exitCode = code ?? 1;
  });
}

run().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
