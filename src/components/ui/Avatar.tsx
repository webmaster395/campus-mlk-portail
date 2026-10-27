/** Pastille avec les initiales (la photo de profil arrive avec la page Profil). */
export default function Avatar({ name, size = 40 }: { name: string; size?: number }) {
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
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials}
    </span>
  );
}
