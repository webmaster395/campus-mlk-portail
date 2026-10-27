import Image from "next/image";

/*
  Logotype officiel MLK Campus (logomark + nom), fichiers fournis par la cliente.
  Comme pour le logomark, ne jamais le recomposer à la main.
    - graphite : sur fond clair
    - blanc    : sur fond sombre ou coloré
*/
export type LogotypeVariant = "graphite" | "blanc";

// Proportions des PNG source (1876 × 834)
const RATIO = 1876 / 834;

export default function Logotype({
  height = 40,
  variant = "graphite",
  priority = false,
}: {
  height?: number;
  variant?: LogotypeVariant;
  priority?: boolean;
}) {
  return (
    <Image
      src={variant === "blanc" ? "/images/logotype-blanc.png" : "/images/logotype.png"}
      alt="MLK Campus"
      width={Math.round(height * RATIO)}
      height={height}
      style={{ height, width: "auto", display: "block" }}
      priority={priority}
    />
  );
}
