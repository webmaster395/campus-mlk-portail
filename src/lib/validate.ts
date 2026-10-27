// Validations d'entrées (adresses, fichiers déposés). Module sans dépendance :
// testé par tests/validate.test.mjs.

/** Vrai pour un identifiant UUID (refuse tout le reste avant d'interroger la base). */
export function isUuid(value: string | null | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Nom de fichier sûr pour Storage : sans accents, espaces ni caractères spéciaux, extension
 * conservée en minuscules. « Mon rapport final (v2).PDF » → « mon-rapport-final-v2.pdf ».
 */
export function safeFileName(rawName: string): string {
  // Jamais de chemin : seulement le dernier segment (« ../../etc/passwd » → « passwd »)
  const name = rawName.split(/[\\/]/).at(-1) ?? "";
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const slug =
    base
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "fichier";
  return extension ? `${slug}.${extension}` : slug;
}

/** Rendus : mêmes limites que le bucket « submissions » (migration storage). */
export const SUBMISSION_MAX_BYTES = 20 * 1024 * 1024;
export const SUBMISSION_EXTENSIONS = [
  "pdf", "zip", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp", "txt", "jpg", "jpeg", "png", "webp",
];
export const SUBMISSION_ACCEPT = SUBMISSION_EXTENSIONS.map((extension) => `.${extension}`).join(",");

/** Photo de profil : mêmes limites que le bucket « avatars ». */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Message d'erreur si le fichier ne peut pas être déposé comme rendu, sinon null. */
export function submissionFileError(name: string, size: number): string | null {
  const extension = name.split(".").at(-1)?.toLowerCase() ?? "";
  if (!SUBMISSION_EXTENSIONS.includes(extension)) {
    return "Ce type de fichier n'est pas accepté. Formats possibles : PDF, ZIP, Word, Excel, PowerPoint, OpenDocument, texte ou image.";
  }
  if (size > SUBMISSION_MAX_BYTES) return "Ce fichier dépasse 20 Mo. Compressez-le ou déposez une archive plus légère.";
  if (size === 0) return "Ce fichier est vide.";
  return null;
}

/** Taille lisible : « 1,2 Mo », « 340 Ko ». */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
}

/** Le dernier segment d'un chemin Storage, sans l'horodatage ajouté au dépôt. */
export function displayFileName(path: string): string {
  return (path.split("/").at(-1) ?? path).replace(/^\d{10,}-/, "");
}
