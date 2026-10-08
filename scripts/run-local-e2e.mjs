import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { readLocalSupabaseEnvironment, seedLocalDemo } from "./seed-local-demo.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const playwrightCli = resolve(repositoryRoot, "node_modules", "playwright", "cli.js");
const nextCli = resolve(repositoryRoot, "node_modules", "next", "dist", "bin", "next");

function runChild(label, executable, args, environment) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(executable, args, {
      cwd: repositoryRoot,
      env: environment,
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", (error) => rejectRun(new Error(`Unable to start ${label}: ${error.message}`)));
    child.on("exit", (code, signal) => {
      if (signal) rejectRun(new Error(`${label} stopped after receiving ${signal}.`));
      else resolveRun(code ?? 1);
    });
  });
}

async function run() {
  const { apiUrl, publishableKey } = await readLocalSupabaseEnvironment();
  await seedLocalDemo();
  const environment = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    ROOMSCOUTER_SITE_URL: "http://127.0.0.1:3100",
    ROOMSCOUTER_UNIVERSITY_NAME: "Nueva Vizcaya State University Bayombong Campus",
    ROOMSCOUTER_UNIVERSITY_LATITUDE: "16.479791986946516",
    ROOMSCOUTER_UNIVERSITY_LONGITUDE: "121.1432206694793",
    PLAYWRIGHT_BROWSERS_PATH: resolve(repositoryRoot, ".playwright-browsers"),
  };

  const buildCode = await runChild("Next.js build", process.execPath, [nextCli, "build"], environment);
  if (buildCode !== 0) {
    process.exitCode = buildCode;
    return;
  }
  process.exitCode = await runChild("Playwright", process.execPath, [playwrightCli, "test", ...process.argv.slice(2)], environment);
}

run().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
