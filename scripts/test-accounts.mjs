#!/usr/bin/env node
// Comptes de test de l'espace étudiant (même principe que Ministry School : domaine
// .invalid, mots de passe aléatoires forts, identifiants dans un fichier local non versionné).
//
//   node scripts/test-accounts.mjs generate  → crée supabase/comptes-test.local.json (s'il
//                                              n'existe pas) et écrit le SQL de création
//                                              dans le fichier indiqué par --sql=<chemin>
//   node scripts/test-accounts.mjs check     → se connecte avec chaque compte (clé publique
//                                              de .env.local) et affiche ce qu'il voit
//
// Suppression : supabase/comptes-test-suppression.sql (efface aussi leurs rendus et notes).

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";

const CREDENTIALS = new URL("../supabase/comptes-test.local.json", import.meta.url);
export const TEST_EMAIL_DOMAIN = "portail-mlk.invalid";

const PROMO_MONTEUR = "b0000000-0000-4000-8000-000000000001";
const PROMO_CUISINE = "b0000000-0000-4000-8000-000000000002";

const ACCOUNTS = [
  { key: "monteur", email: `ines.martin@${TEST_EMAIL_DOMAIN}`, first_name: "Inès", last_name: "Martin", promotion_id: PROMO_MONTEUR, note: "Promotion Monteur audiovisuel, avec rendu et notes de démo" },
  { key: "cuisine", email: `yanis.diallo@${TEST_EMAIL_DOMAIN}`, first_name: "Yanis", last_name: "Diallo", promotion_id: PROMO_CUISINE, note: "Promotion Commis de cuisine : ne voit rien de la filière audiovisuelle" },
  { key: "desactive", email: `lea.roux@${TEST_EMAIL_DOMAIN}`, first_name: "Léa", last_name: "Roux", promotion_id: PROMO_MONTEUR, deactivated: true, note: "Compte désactivé : redirigé vers /auth/desactive" },
  { key: "sans-promo", email: `nouvel.apprenti@${TEST_EMAIL_DOMAIN}`, first_name: "Sam", last_name: "Nouveau", promotion_id: null, note: "Aucune promotion : états vides" },
];

function password() {
  return `Mlk!${randomBytes(18).toString("base64url")}9a`;
}

function sqlString(value) {
  return value === null || value === undefined ? "null" : `'${String(value).replaceAll("'", "''")}'`;
}

async function loadCredentials() {
  return JSON.parse(await readFile(CREDENTIALS, "utf8"));
}

async function generate() {
  const sqlArg = process.argv.find((arg) => arg.startsWith("--sql="))?.slice(6);
  if (!sqlArg) throw new Error("Préciser --sql=<chemin> pour le fichier SQL généré.");

  if (!existsSync(CREDENTIALS)) {
    const accounts = ACCOUNTS.map((account) => ({ ...account, id: randomUUID(), password: password() }));
    await writeFile(CREDENTIALS, `${JSON.stringify({ createdAt: new Date().toISOString(), accounts }, null, 2)}\n`, { mode: 0o600 });
  }
  const { accounts } = await loadCredentials();

  const users = accounts.map((a) => {
    // La promotion va dans les métadonnées d'application : seules lues par le trigger
    const appMetadata = JSON.stringify({ provider: "email", providers: ["email"], is_test_account: true, ...(a.promotion_id ? { promotion_id: a.promotion_id } : {}) });
    const metadata = JSON.stringify({ first_name: a.first_name, last_name: a.last_name });
    return `  (${sqlString(a.id)}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', ${sqlString(a.email)},
    extensions.crypt(${sqlString(a.password)}, extensions.gen_salt('bf')), now(),
    ${sqlString(appMetadata)}, ${sqlString(metadata)},
    now(), now(), '', '', '', '')`;
  });
  const identities = accounts.map((a) => {
    const data = JSON.stringify({ sub: a.id, email: a.email, email_verified: true });
    return `  (${sqlString(a.id)}, ${sqlString(a.id)}, ${sqlString(data)}, 'email', now(), now(), now())`;
  });
  const deactivated = accounts.filter((a) => a.deactivated).map((a) => sqlString(a.id));

  const sql = `-- Généré par scripts/test-accounts.mjs : comptes de test (rejouable).
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change)
values
${users.join(",\n")}
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
${identities.join(",\n")}
on conflict (provider_id, provider) do nothing;
${deactivated.length ? `\nupdate public.profiles set deactivated = true where id in (${deactivated.join(", ")});\n` : ""}
select email, promotion_id, deactivated from public.profiles
where email like '%@${TEST_EMAIL_DOMAIN}' order by email;
`;
  await writeFile(sqlArg, sql, { mode: 0o600 });
  console.log(`SQL écrit (${accounts.length} comptes). Identifiants : supabase/comptes-test.local.json`);
}

async function readEnv() {
  const env = await readFile(new URL("../.env.local", import.meta.url), "utf8");
  const value = (name) => env.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim();
  return { url: value("NEXT_PUBLIC_SUPABASE_URL"), key: value("NEXT_PUBLIC_SUPABASE_ANON_KEY") };
}

async function check() {
  const { url, key } = await readEnv();
  const { accounts } = await loadCredentials();
  for (const account of accounts) {
    const token = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email: account.email, password: account.password }),
    });
    const session = await token.json();
    if (!token.ok) {
      console.log(`${account.key.padEnd(10)} connexion REFUSÉE (HTTP ${token.status} ${session.error_code ?? ""})`);
      continue;
    }
    const headers = { apikey: key, Authorization: `Bearer ${session.access_token}` };
    const viewer = await fetch(`${url}/rest/v1/rpc/student_viewer_context`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: "{}" }).then((r) => r.json());
    const count = async (table) => {
      const response = await fetch(`${url}/rest/v1/${table}?select=id`, { headers: { ...headers, Prefer: "count=exact", Range: "0-0" } });
      return response.headers.get("content-range")?.split("/")[1] ?? `HTTP ${response.status}`;
    };
    const counts = {};
    for (const table of ["sessions", "courses", "materials", "assignments", "submissions", "evaluations", "grades", "announcements"]) {
      counts[table] = await count(table);
    }
    console.log(
      `${account.key.padEnd(10)} connexion OK · ${viewer.first_name} ${viewer.last_name} · ` +
        `${viewer.formation?.title ?? "sans formation"} · désactivé : ${viewer.deactivated} · ` +
        `non lues : ${viewer.unread_announcements} · ${JSON.stringify(counts)}`,
    );
  }
}

const command = process.argv[2];
if (command === "generate") await generate();
else if (command === "check") await check();
else {
  console.error("Usage : node scripts/test-accounts.mjs generate --sql=<chemin> | check");
  process.exit(1);
}
