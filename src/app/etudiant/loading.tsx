/* Squelette affiché pendant le chargement des données de la page (Suspense automatique). */
export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true" aria-label="Chargement">
      <div className="h-3 w-32 rounded-full bg-black/10" />
      <div className="h-12 w-72 max-w-full rounded-xl bg-black/10" />
      <div className="h-32 w-full max-w-[560px] rounded-2xl bg-black/[0.06]" />
    </div>
  );
}
