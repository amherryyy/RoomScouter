import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

import { createClient } from "@supabase/supabase-js";

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const DEMO_PASSWORD = "RoomScouterDemo!2026";
export const demoListingIds = [
  "10000000-0000-4000-8000-000000000001",
  "10000000-0000-4000-8000-000000000002",
  "10000000-0000-4000-8000-000000000003",
  "10000000-0000-4000-8000-000000000004",
];
const demoReviewIds = [
  "20000000-0000-4000-8000-000000000001",
  "20000000-0000-4000-8000-000000000002",
  "20000000-0000-4000-8000-000000000003",
];
const demoReportIds = [
  "30000000-0000-4000-8000-000000000001",
  "30000000-0000-4000-8000-000000000002",
];

export function parseSupabaseEnvironment(output) {
  return Object.fromEntries(output.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(?:"([^"]*)"|'([^']*)'|(.*))$/);
    return match ? [[match[1], match[2] ?? match[3] ?? match[4] ?? ""]] : [];
  }));
}

export function requireLocalSupabaseUrl(value) {
  const url = new URL(value);
  const localHost = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  if (url.protocol !== "http:" || !localHost || url.port !== "54321") {
    throw new Error("Demo seeding is restricted to the local Supabase API at http://127.0.0.1:54321.");
  }
  return url.origin;
}

async function readLocalSupabaseEnvironment() {
  const supabaseCli = resolve(repositoryRoot, "node_modules", "supabase", "dist", "supabase.js");
  let stdout;
  try {
    ({ stdout } = await execFileAsync(process.execPath, [supabaseCli, "status", "-o", "env"], {
      cwd: repositoryRoot,
      windowsHide: true,
    }));
  } catch {
    throw new Error("Local Supabase is unavailable. Start Docker Desktop, then run `npx.cmd supabase start`.");
  }
  const environment = parseSupabaseEnvironment(stdout);
  const apiUrl = requireLocalSupabaseUrl(environment.API_URL ?? environment.SUPABASE_URL ?? "");
  const adminKey = environment.SERVICE_ROLE_KEY ?? environment.SECRET_KEY;
  if (!adminKey) throw new Error("The running local Supabase stack did not provide an administrator key.");
  return { apiUrl, adminKey };
}

function assertSuccess(label, error) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

async function findUserByEmail(client, email) {
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 100 });
    assertSuccess("List local demo users", error);
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email);
    if (user || data.users.length < 100) return user ?? null;
  }
  throw new Error("The local user list exceeded the supported demo seed size.");
}

async function ensureDemoUser(client, definition) {
  const email = definition.email.toLowerCase();
  const existing = await findUserByEmail(client, email);
  if (existing) {
    const { data, error } = await client.auth.admin.updateUserById(existing.id, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        display_name: definition.displayName,
        requested_role: definition.requestedRole,
      },
    });
    assertSuccess(`Refresh ${email}`, error);
    return data.user;
  }

  const { data, error } = await client.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      display_name: definition.displayName,
      requested_role: definition.requestedRole,
    },
  });
  assertSuccess(`Create ${email}`, error);
  return data.user;
}

async function deleteDemoRows(client) {
  const deletions = [
    ["reports", "id", demoReportIds],
    ["favorites", "boarding_house_id", demoListingIds],
    ["reviews", "id", demoReviewIds],
    ["review_moderation_events", "boarding_house_id", demoListingIds],
    ["listing_photos", "boarding_house_id", demoListingIds],
    ["boarding_house_facilities", "boarding_house_id", demoListingIds],
    ["boarding_house_utilities", "boarding_house_id", demoListingIds],
    ["house_rules", "boarding_house_id", demoListingIds],
    ["moderation_events", "boarding_house_id", demoListingIds],
    ["boarding_houses", "id", demoListingIds],
  ];
  for (const [table, column, values] of deletions) {
    const { error } = await client.from(table).delete().in(column, values);
    assertSuccess(`Reset demo ${table}`, error);
  }
}

async function insertDemoRows(client, users) {
  const approvedAt = "2026-09-15T02:00:00.000Z";
  const submittedAt = "2026-09-14T02:00:00.000Z";
  const listingRows = [
    {
      id: demoListingIds[0], owner_id: users.owner.id, title: "Campus Gate Residences",
      description: "A quiet demo residence near the NVSU Bayombong campus with shared study space, secure entry, and furnished bedspaces for students.",
      address_line: "Quezon Street demo location, Bayombong, Nueva Vizcaya", monthly_rent: 3500,
      room_type: "bedspace", available_rooms: 4, contact_name: "Lina Santos",
      contact_phone: "+63 917 555 0101", contact_email: "owner@roomscouter.example.test",
      latitude: 16.480520, longitude: 121.144080, status: "approved", submitted_at: submittedAt,
      moderated_at: approvedAt, moderated_by: users.admin.id, moderation_note: null,
    },
    {
      id: demoListingIds[1], owner_id: users.owner.id, title: "Magat View Student Homes",
      description: "A fictional pilot listing with private rooms, a shared kitchen, reliable internet, and a calm study-friendly environment.",
      address_line: "National Road demo location, Bayombong, Nueva Vizcaya", monthly_rent: 5200,
      room_type: "private_room", available_rooms: 2, contact_name: "Lina Santos",
      contact_phone: "+63 917 555 0101", contact_email: "owner@roomscouter.example.test",
      latitude: 16.475900, longitude: 121.141100, status: "approved", submitted_at: submittedAt,
      moderated_at: approvedAt, moderated_by: users.admin.id, moderation_note: null,
    },
    {
      id: demoListingIds[2], owner_id: users.owner.id, title: "Bayombong Study Suites",
      description: "A fictional studio option for the RoomScouter pilot with air conditioning, a private bathroom, and space for independent study.",
      address_line: "Magsaysay Avenue demo location, Bayombong, Nueva Vizcaya", monthly_rent: 7000,
      room_type: "studio", available_rooms: 1, contact_name: "Lina Santos",
      contact_phone: "+63 917 555 0101", contact_email: "owner@roomscouter.example.test",
      latitude: 16.484050, longitude: 121.146180, status: "approved", submitted_at: submittedAt,
      moderated_at: approvedAt, moderated_by: users.admin.id, moderation_note: null,
    },
    {
      id: demoListingIds[3], owner_id: users.owner.id, title: "Quezon Corner Boarding House",
      description: "A fictional shared-room listing awaiting administrator review, included to demonstrate the moderation queue.",
      address_line: "Quezon Street demo location, Bayombong, Nueva Vizcaya", monthly_rent: 4200,
      room_type: "shared_room", available_rooms: 3, contact_name: "Lina Santos",
      contact_phone: "+63 917 555 0101", contact_email: "owner@roomscouter.example.test",
      latitude: 16.478300, longitude: 121.141900, status: "pending", submitted_at: "2026-09-20T02:00:00.000Z",
      moderated_at: null, moderated_by: null, moderation_note: null,
    },
  ];
  let result = await client.from("boarding_houses").insert(listingRows);
  assertSuccess("Create demo listings", result.error);

  result = await client.from("moderation_events").insert(demoListingIds.slice(0, 3).map((boardingHouseId) => ({
    boarding_house_id: boardingHouseId,
    actor_id: users.admin.id,
    action: "approved",
    reason: null,
    created_at: approvedAt,
  })));
  assertSuccess("Create demo listing decisions", result.error);

  result = await client.from("boarding_house_facilities").insert([
    { boarding_house_id: demoListingIds[0], facility_id: 1 },
    { boarding_house_id: demoListingIds[0], facility_id: 2 },
    { boarding_house_id: demoListingIds[0], facility_id: 8 },
    { boarding_house_id: demoListingIds[1], facility_id: 1 },
    { boarding_house_id: demoListingIds[1], facility_id: 3 },
    { boarding_house_id: demoListingIds[1], facility_id: 7 },
    { boarding_house_id: demoListingIds[2], facility_id: 5 },
    { boarding_house_id: demoListingIds[2], facility_id: 6 },
  ]);
  assertSuccess("Create demo facilities", result.error);

  result = await client.from("boarding_house_utilities").insert([
    { boarding_house_id: demoListingIds[0], utility_id: 2, is_included: true, details: "Included" },
    { boarding_house_id: demoListingIds[0], utility_id: 3, is_included: true, details: "Shared Wi-Fi" },
    { boarding_house_id: demoListingIds[1], utility_id: 1, is_included: false, details: "Submetered monthly" },
    { boarding_house_id: demoListingIds[1], utility_id: 2, is_included: true, details: "Included" },
    { boarding_house_id: demoListingIds[2], utility_id: 1, is_included: false, details: "Based on usage" },
  ]);
  assertSuccess("Create demo utilities", result.error);

  result = await client.from("house_rules").insert([
    { id: "40000000-0000-4000-8000-000000000001", boarding_house_id: demoListingIds[0], rule_text: "Observe quiet hours from 10 PM to 6 AM.", position: 1 },
    { id: "40000000-0000-4000-8000-000000000002", boarding_house_id: demoListingIds[0], rule_text: "Keep shared study areas clean after use.", position: 2 },
    { id: "40000000-0000-4000-8000-000000000003", boarding_house_id: demoListingIds[1], rule_text: "Register overnight visitors with the owner.", position: 1 },
    { id: "40000000-0000-4000-8000-000000000004", boarding_house_id: demoListingIds[2], rule_text: "Cooking is allowed only in the designated kitchenette.", position: 1 },
  ]);
  assertSuccess("Create demo house rules", result.error);

  result = await client.from("reviews").insert([
    { id: demoReviewIds[0], student_id: users.student.id, boarding_house_id: demoListingIds[0], rating: 5, comment: "The study area is useful and the walk to campus is short." },
    { id: demoReviewIds[1], student_id: users.secondStudent.id, boarding_house_id: demoListingIds[0], rating: 4, comment: "Clean shared spaces and clear house rules during my visit." },
    { id: demoReviewIds[2], student_id: users.student.id, boarding_house_id: demoListingIds[1], rating: 4, comment: "The private room layout is practical for studying." },
  ]);
  assertSuccess("Create demo reviews", result.error);

  result = await client.from("favorites").insert([
    { student_id: users.student.id, boarding_house_id: demoListingIds[0] },
    { student_id: users.student.id, boarding_house_id: demoListingIds[2] },
  ]);
  assertSuccess("Create demo favorites", result.error);

  result = await client.from("reports").insert([
    { id: demoReportIds[0], reporter_id: users.secondStudent.id, target_type: "listing", boarding_house_id: demoListingIds[1], reason: "Please verify whether the electricity estimate is current." },
    { id: demoReportIds[1], reporter_id: users.student.id, target_type: "review", review_id: demoReviewIds[1], reason: "Please check whether this review describes a completed stay." },
  ]);
  assertSuccess("Create demo reports", result.error);
}

export async function seedLocalDemo() {
  const { apiUrl, adminKey } = await readLocalSupabaseEnvironment();
  const client = createClient(apiUrl, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const definitions = {
    student: { email: "student@roomscouter.example.test", displayName: "Mika Student", requestedRole: "student" },
    secondStudent: { email: "student2@roomscouter.example.test", displayName: "Paolo Student", requestedRole: "student" },
    owner: { email: "owner@roomscouter.example.test", displayName: "Lina Santos", requestedRole: "owner" },
    admin: { email: "admin@roomscouter.example.test", displayName: "Ari Administrator", requestedRole: "student" },
  };
  const users = Object.fromEntries(await Promise.all(Object.entries(definitions).map(async ([key, definition]) => (
    [key, await ensureDemoUser(client, definition)]
  ))));

  const { error: adminError } = await client.from("profiles").update({ role: "admin" }).eq("id", users.admin.id);
  assertSuccess("Provision local demo administrator", adminError);
  await deleteDemoRows(client);
  await insertDemoRows(client, users);

  return {
    apiUrl,
    accounts: Object.values(definitions).map(({ email, displayName }) => ({ email, displayName })),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  seedLocalDemo()
    .then(({ apiUrl, accounts }) => {
      process.stdout.write(`Seeded ${accounts.length} demo accounts and ${demoListingIds.length} listings at ${apiUrl}.\n`);
      process.stdout.write(`Demo password: ${DEMO_PASSWORD}\n`);
      for (const account of accounts) process.stdout.write(`- ${account.displayName}: ${account.email}\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
}
