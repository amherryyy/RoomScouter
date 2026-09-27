import { readdir, readFile } from "node:fs/promises";

import { PGlite } from "@electric-sql/pglite";

const migrationsUrl = new URL("../../supabase/migrations/", import.meta.url);

export const userIds = {
  student: "00000000-0000-4000-8000-000000000001",
  owner: "00000000-0000-4000-8000-000000000002",
  forgedAdmin: "00000000-0000-4000-8000-000000000003",
  admin: "00000000-0000-4000-8000-000000000004",
  secondOwner: "00000000-0000-4000-8000-000000000005",
};

export const listingInput = {
  title: "Maple Student Residence",
  description: "A quiet boarding house within walking distance of the university.",
  address: "12 University Avenue",
  monthlyRent: 4500,
  roomType: "private_room",
  availableRooms: 2,
  contactName: "Owner account",
  contactPhone: "+63 900 000 0000",
  latitude: 14.599512,
  longitude: 120.984222,
};

export async function createDatabase() {
  const database = new PGlite();

  await database.exec(`
    create role anon nologin;
    create role authenticated nologin;

    create schema auth;
    create table auth.users (
      id uuid primary key,
      email text unique,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );

    create function auth.uid()
    returns uuid
    language sql
    stable
    as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $$;

    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;

    create schema storage;
    create table storage.buckets (
      id text primary key,
      name text not null,
      public boolean not null default false,
      file_size_limit bigint,
      allowed_mime_types text[]
    );
    create table storage.objects (
      id uuid primary key default gen_random_uuid(),
      bucket_id text not null references storage.buckets (id),
      name text not null,
      metadata jsonb,
      unique (bucket_id, name)
    );

    alter table storage.objects enable row level security;
    alter table storage.objects force row level security;
    grant usage on schema storage to anon, authenticated;
    grant select, insert, update, delete on table storage.objects to anon, authenticated;
  `);

  const migrations = (await readdir(migrationsUrl))
    .filter((name) => name.endsWith(".sql"))
    .sort();
  for (const migration of migrations) {
    await database.exec(await readFile(new URL(migration, migrationsUrl), "utf8"));
  }

  return database;
}

export async function registerUser(
  database,
  { id, displayName, requestedRole, email = `${id}@example.test` },
) {
  await database.query(
    `insert into auth.users (id, email, raw_user_meta_data)
     values ($1, $2, jsonb_build_object(
       'display_name', $3::text,
       'requested_role', $4::text
     ))`,
    [id, email, displayName, requestedRole],
  );
}

export async function provisionAdmin(database, { id, displayName }) {
  await database.query(
    `insert into auth.users (id, email, raw_user_meta_data)
     values ($1, $2, jsonb_build_object('display_name', $3::text))
     on conflict (id) do nothing`,
    [id, `${id}@example.test`, displayName],
  );
  await database.query(`update public.profiles set role = 'admin' where id = $1`, [id]);
}

export async function actAs(database, role, userId, operation) {
  await database.exec(`set role ${role}`);
  await database.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId ?? ""]);

  try {
    return await operation();
  } finally {
    await database.exec("reset role");
    await database.exec(`select set_config('request.jwt.claim.sub', '', false)`);
  }
}

export async function createListing(database, ownerId = userIds.owner) {
  return actAs(database, "authenticated", ownerId, () =>
    database.query(
      `insert into public.boarding_houses (
        owner_id, title, description, address_line, monthly_rent, room_type,
        available_rooms, contact_name, contact_phone, latitude, longitude
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      returning id, owner_id, status`,
      [
        ownerId,
        listingInput.title,
        listingInput.description,
        listingInput.address,
        listingInput.monthlyRent,
        listingInput.roomType,
        listingInput.availableRooms,
        listingInput.contactName,
        listingInput.contactPhone,
        listingInput.latitude,
        listingInput.longitude,
      ],
    ),
  );
}
