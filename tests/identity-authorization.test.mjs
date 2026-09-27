import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

import { PGlite } from "@electric-sql/pglite";

const migrationsUrl = new URL("../supabase/migrations/", import.meta.url);

const userIds = {
  student: "00000000-0000-4000-8000-000000000001",
  owner: "00000000-0000-4000-8000-000000000002",
  forgedAdmin: "00000000-0000-4000-8000-000000000003",
  admin: "00000000-0000-4000-8000-000000000004",
};

async function createDatabase() {
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
  `);

  const migrations = (await readdir(migrationsUrl))
    .filter((name) => name.endsWith(".sql"))
    .sort();
  for (const migration of migrations) {
    await database.exec(await readFile(new URL(migration, migrationsUrl), "utf8"));
  }
  return database;
}

async function registerUser(database, { id, displayName, requestedRole, email = `${id}@example.test` }) {
  await database.query(
    `insert into auth.users (id, email, raw_user_meta_data)
     values ($1, $2, jsonb_build_object(
       'display_name', $3::text,
       'requested_role', $4::text
     ))`,
    [id, email, displayName, requestedRole],
  );
}

async function provisionAdmin(database, { id, displayName }) {
  await database.query(
    `insert into auth.users (id, email, raw_user_meta_data)
     values ($1, $2, jsonb_build_object('display_name', $3::text))
     on conflict (id) do nothing`,
    [id, `${id}@example.test`, displayName],
  );
  await database.query(`update public.profiles set role = 'admin' where id = $1`, [id]);
}

async function actAs(database, role, userId, operation) {
  await database.exec(`set role ${role}`);
  await database.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId ?? ""]);

  try {
    return await operation();
  } finally {
    await database.exec("reset role");
    await database.exec(`select set_config('request.jwt.claim.sub', '', false)`);
  }
}

test("the identity migration enforces executable PostgreSQL authorization", async (t) => {
  const database = await createDatabase();
  t.after(() => database.close());

  await registerUser(database, {
    id: userIds.student,
    displayName: "Student account",
    requestedRole: "student",
  });
  await registerUser(database, {
    id: userIds.owner,
    displayName: "Owner account",
    requestedRole: "owner",
  });
  await registerUser(database, {
    id: userIds.forgedAdmin,
    displayName: "Forged admin",
    requestedRole: "admin",
  });
  await provisionAdmin(database, {
    id: userIds.admin,
    displayName: "Admin account",
  });

  await t.test("anonymous profile access is denied", async () => {
    await assert.rejects(
      actAs(database, "anon", null, () => database.query("select * from public.profiles")),
      /permission denied/i,
    );
  });

  await t.test("student and owner can read and rename only themselves", async () => {
    for (const actor of ["student", "owner"]) {
      const id = userIds[actor];
      const visible = await actAs(database, "authenticated", id, () =>
        database.query("select id from public.profiles order by id"),
      );
      assert.deepEqual(visible.rows, [{ id }]);

      const displayName = `${actor} renamed`;
      const renamed = await actAs(database, "authenticated", id, () =>
        database.query(
          "update public.profiles set display_name = $1 where id = $2 returning display_name",
          [displayName, id],
        ),
      );
      assert.deepEqual(renamed.rows, [{ display_name: displayName }]);
    }
  });

  await t.test("cross-user reads and writes are denied", async () => {
    const crossRead = await actAs(database, "authenticated", userIds.student, () =>
      database.query("select id from public.profiles where id = $1", [userIds.owner]),
    );
    assert.deepEqual(crossRead.rows, []);

    const crossWrite = await actAs(database, "authenticated", userIds.student, () =>
      database.query(
        "update public.profiles set display_name = 'Hijacked' where id = $1 returning id",
        [userIds.owner],
      ),
    );
    assert.deepEqual(crossWrite.rows, []);
  });

  await t.test("authenticated users cannot change roles", async () => {
    await assert.rejects(
      actAs(database, "authenticated", userIds.student, () =>
        database.query("update public.profiles set role = 'admin' where id = $1", [
          userIds.student,
        ]),
      ),
      /permission denied/i,
    );
  });

  await t.test("owner registration creates an owner profile", async () => {
    const profile = await database.query("select role from public.profiles where id = $1", [
      userIds.owner,
    ]);
    assert.deepEqual(profile.rows, [{ role: "owner" }]);
  });

  await t.test("forged admin registration metadata falls back to student", async () => {
    const profile = await database.query("select role from public.profiles where id = $1", [
      userIds.forgedAdmin,
    ]);
    assert.deepEqual(profile.rows, [{ role: "student" }]);
  });

  await t.test("the privileged admin fixture is repeatable", async () => {
    await provisionAdmin(database, {
      id: userIds.admin,
      displayName: "Ignored on repeat",
    });
    const profile = await database.query("select display_name, role from public.profiles where id = $1", [
      userIds.admin,
    ]);
    assert.deepEqual(profile.rows, [{ display_name: "Admin account", role: "admin" }]);
  });

  await t.test("only a privileged database session can provision an administrator", async () => {
    const targetEmail = `${userIds.owner}@example.test`;

    for (const role of ["anon", "authenticated"]) {
      await assert.rejects(
        actAs(database, role, userIds.student, () =>
          database.query("select public.provision_admin($1)", [targetEmail]),
        ),
        /permission denied/i,
      );
    }

    const first = await database.query("select public.provision_admin($1) as id", [
      `  ${targetEmail.toUpperCase()}  `,
    ]);
    const repeated = await database.query("select public.provision_admin($1) as id", [targetEmail]);
    const profile = await database.query("select role from public.profiles where id = $1", [
      userIds.owner,
    ]);

    assert.deepEqual(first.rows, [{ id: userIds.owner }]);
    assert.deepEqual(repeated.rows, [{ id: userIds.owner }]);
    assert.deepEqual(profile.rows, [{ role: "admin" }]);
    await assert.rejects(
      database.query("select public.provision_admin('missing@example.test')"),
      /No authentication user exists/i,
    );
  });

  await t.test("admins can read all profiles but cannot rename another user", async () => {
    const visible = await actAs(database, "authenticated", userIds.admin, () =>
      database.query("select id from public.profiles order by id"),
    );
    assert.equal(visible.rows.length, 4);

    const changed = await actAs(database, "authenticated", userIds.admin, () =>
      database.query(
        "update public.profiles set display_name = 'Admin overwrite' where id = $1 returning id",
        [userIds.student],
      ),
    );
    assert.deepEqual(changed.rows, []);
  });
});
