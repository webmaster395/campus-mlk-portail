import assert from "node:assert/strict";
import test from "node:test";
import {
  DEACTIVATED_MESSAGE,
  passwordErrorMessage,
  safeNextPath,
  signInErrorMessage,
  signUpErrorMessage,
} from "../src/lib/auth-messages.ts";

test("les erreurs d'inscription sont traduites", () => {
  assert.match(signUpErrorMessage("user_already_exists"), /existe déjà/);
  assert.match(signUpErrorMessage("weak_password"), /trop simple/);
  assert.match(signUpErrorMessage("signup_disabled"), /fermées/);
  assert.match(signUpErrorMessage("over_email_send_rate_limit"), /Trop de demandes/);
  assert.match(signUpErrorMessage("email_address_invalid"), /ne peut pas être utilisée/);
  assert.match(signUpErrorMessage("unexpected_failure"), /n'a pas pu être créé/);
});

test("les erreurs de connexion ne révèlent pas si le compte existe", () => {
  assert.equal(signInErrorMessage("invalid_credentials"), "E-mail ou mot de passe incorrect.");
  assert.equal(signInErrorMessage(undefined, "Invalid login credentials"), "E-mail ou mot de passe incorrect.");
});

test("un compte bloqué ou désactivé reçoit le message dédié", () => {
  assert.equal(signInErrorMessage("user_banned"), DEACTIVATED_MESSAGE);
});

test("e-mail non confirmé et excès de tentatives ont leur message", () => {
  assert.match(signInErrorMessage("email_not_confirmed"), /pas encore confirmée/);
  assert.match(signInErrorMessage("over_request_rate_limit"), /Trop de tentatives/);
});

test("les refus de mot de passe sont expliqués", () => {
  assert.match(passwordErrorMessage("same_password"), /déjà votre mot de passe/);
  assert.match(passwordErrorMessage("weak_password"), /trop simple/);
  assert.match(passwordErrorMessage("unexpected_failure"), /n'a pas pu être enregistré/);
});

test("le chemin de retour reste sur le site (pas de redirection ouverte)", () => {
  assert.equal(safeNextPath("/auth/reinitialiser"), "/auth/reinitialiser");
  assert.equal(safeNextPath("/etudiant/travail?onglet=rendus"), "/etudiant/travail?onglet=rendus");
  assert.equal(safeNextPath("//evil.example"), "/etudiant");
  assert.equal(safeNextPath("/\\evil.example"), "/etudiant");
  assert.equal(safeNextPath("https://evil.example"), "/etudiant");
  assert.equal(safeNextPath(null, "/login"), "/login");
});
