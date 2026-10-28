/** Photo de profil, ou pastille avec les initiales s'il n'y en a pas. */
export default function Avatar({
  name,
  size = 40,
  src = null,
  color,
}: {
  name: string;
  size?: number;
  src?: string | null;
  /** Fond des initiales (couleur de la filière) ; violet iris par défaut. */
  color?: string;
}) {
  if (src) {
    return (
      // URL signée et temporaire du bucket privé : pas d'optimisation next/image
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-iris font-semibold text-white"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38), ...(color ? { backgroundColor: color } : {}) }}
    >
      {initials}
    </span>
  );
}
