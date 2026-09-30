import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

function requiredText(environment, name, maximumLength = 200) {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`${name} is required for deployment.`);
  if (value.length > maximumLength) throw new Error(`${name} is too long.`);
  return value;
}

function secureOrigin(environment, name, expectedHostSuffix) {
  const value = requiredText(environment, name, 500);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid HTTPS origin.`);
  }
  if (
    url.protocol !== "https:"
    || url.username
    || url.password
    || url.search
    || url.hash
    || (url.pathname !== "/" && url.pathname !== "")
  ) throw new Error(`${name} must be a clean HTTPS origin without credentials, a path, query, or fragment.`);
  if (expectedHostSuffix && !url.hostname.endsWith(expectedHostSuffix)) {
    throw new Error(`${name} must identify a hosted Supabase project.`);
  }
  return url.origin;
}

function publishableKey(environment) {
  const value = requiredText(environment, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", 4096);
  if (value.startsWith("sb_secret_") || /service_role/i.test(value)) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must never contain a secret or service-role key.");
  }
  if (value.startsWith("sb_publishable_") && value.length >= 24) return "publishable";

  const parts = value.split(".");
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      if (payload.role === "anon") return "legacy anon";
    } catch {
      // Fall through to the safe generic error below.
    }
  }
  throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a publishable or legacy anon key.");
}

function coordinate(environment, name, minimum, maximum) {
  const text = requiredText(environment, name, 50);
  const value = Number(text);
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be a number from ${minimum} through ${maximum}.`);
  }
  return value;
}

export function validateDeploymentEnvironment(environment) {
  const siteUrl = secureOrigin(environment, "ROOMSCOUTER_SITE_URL");
  const supabaseUrl = secureOrigin(environment, "NEXT_PUBLIC_SUPABASE_URL", ".supabase.co");
  if (siteUrl === supabaseUrl) throw new Error("The RoomScouter and Supabase origins must be different.");

  return {
    siteUrl,
    supabaseUrl,
    keyKind: publishableKey(environment),
    university: {
      name: requiredText(environment, "ROOMSCOUTER_UNIVERSITY_NAME", 160),
      latitude: coordinate(environment, "ROOMSCOUTER_UNIVERSITY_LATITUDE", -90, 90),
      longitude: coordinate(environment, "ROOMSCOUTER_UNIVERSITY_LONGITUDE", -180, 180),
    },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const configuration = validateDeploymentEnvironment(process.env);
    process.stdout.write("RoomScouter deployment configuration is ready.\n");
    process.stdout.write(`- Site: ${configuration.siteUrl}\n`);
    process.stdout.write(`- Supabase: ${configuration.supabaseUrl}\n`);
    process.stdout.write(`- Browser key type: ${configuration.keyKind}\n`);
    process.stdout.write(`- University: ${configuration.university.name} (${configuration.university.latitude}, ${configuration.university.longitude})\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
