import assert from "node:assert/strict";
import test from "node:test";
import { displayFileName, formatFileSize, isUuid, safeFileName, submissionFileError } from "../src/lib/validate.ts";

test("fichiers de rendu : formats et taille du bucket", () => {
  assert.equal(submissionFileError("maquette.zip", 1024), null);
  assert.equal(submissionFileError("Rapport.PDF", 1024), null);
  assert.match(submissionFileError("virus.exe", 1024), /n'est pas accepté/);
  assert.match(submissionFileError("sans-extension", 1024), /n'est pas accepté/);
  assert.match(submissionFileError("gros.pdf", 21 * 1024 * 1024), /dépasse 20 Mo/);
  assert.match(submissionFileError("vide.pdf", 0), /vide/);
});

test("seuls les UUID passent", () => {
  assert.equal(isUuid("c0000000-0000-4000-8000-000000000001"), true);
  assert.equal(isUuid("1 or 1=1"), false);
  assert.equal(isUuid(""), false);
  assert.equal(isUuid(undefined), false);
});

test("noms de fichiers sûrs pour le stockage", () => {
  assert.equal(safeFileName("Mon rapport final (v2).PDF"), "mon-rapport-final-v2.pdf");
  assert.equal(safeFileName("Évaluation été.docx"), "evaluation-ete.docx");
  assert.equal(safeFileName("../../etc/passwd"), "passwd");
  assert.equal(safeFileName("C:\\Users\\moi\\CV.pdf"), "cv.pdf");
  assert.equal(safeFileName(".zip"), "zip");
  assert.equal(safeFileName("???.png"), "fichier.png");
});

test("tailles et noms affichés", () => {
  assert.equal(formatFileSize(340 * 1024), "340 Ko");
  assert.equal(formatFileSize(1.25 * 1024 * 1024), "1,3 Mo");
  assert.equal(displayFileName("a2/9b/1793142000000-maquette.zip"), "maquette.zip");
});
