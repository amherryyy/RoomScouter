import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(projectRoot, "node_modules", "supabase", "dist", "supabase.js");
const outputPath = path.join(projectRoot, "src", "lib", "supabase", "database.types.ts");

const result = spawnSync(
  process.execPath,
  [cliPath, "gen", "types", "typescript", "--linked", "--schema", "public"],
  {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  },
);

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  process.exit(result.status ?? 1);
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, result.stdout, { encoding: "utf8" });
process.stdout.write(`Generated ${path.relative(projectRoot, outputPath)}\n`);
