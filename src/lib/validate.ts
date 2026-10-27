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

/** Taille lisible : « 1,2 Mo », « 340 Ko ». */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo`;
}

/** Le dernier segment d'un chemin Storage, sans l'horodatage ajouté au dépôt. */
export function displayFileName(path: string): string {
  return (path.split("/").at(-1) ?? path).replace(/^\d{10,}-/, "");
}
