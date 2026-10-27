import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("le build Production refuse une configuration Supabase incomplète", async () => {
  const script = await source("scripts/validate-server-env.mjs");
  assert.match(script, /VERCEL_ENV === "production"/);
  assert.match(script, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(script, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.match(script, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(script, /console\.log\([^)]*process\.env/);
});

test("aucune clé secrète n'est exposée au navigateur dans l'exemple d'environnement", async () => {
  const example = await source(".env.example");
  assert.doesNotMatch(example, /NEXT_PUBLIC_[A-Z_]*(SERVICE|SECRET)/);
});
