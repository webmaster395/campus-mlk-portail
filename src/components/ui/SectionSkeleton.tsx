/** Squelette générique d'une page de l'espace, affiché par les loading.tsx. */
export default function SectionSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="flex animate-pulse flex-col gap-8" aria-busy="true" aria-label="Chargement">
      <div className="flex flex-col gap-3">
        <div className="h-3 w-28 rounded-full bg-black/10" />
        <div className="h-11 w-72 max-w-full rounded-xl bg-black/10" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="h-36 rounded-2xl bg-black/[0.06]" />
        ))}
      </div>
    </div>
  );
}
