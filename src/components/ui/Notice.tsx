/** Message d'erreur ou de confirmation, annoncé aux lecteurs d'écran. */
export default function Notice({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-alerte/35 bg-alerte/10 text-[#a3203f]"
      : "border-succes/45 bg-succes/12 text-[#1d6b55]";
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`m-0 rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles}`}
    >
      {children}
    </p>
  );
}
