import Logomark from "@/components/brand/Logomark";
import Logotype from "@/components/brand/Logotype";

/*
  Page provisoire de l'étape 0 : vérifie que la charte est bien en place.
  À l'étape 2, « / » redirigera vers /etudiant (connecté) ou /login.
*/
const PALETTE = [
  { name: "Porcelaine", hex: "#f9f9f9", className: "bg-porcelaine" },
  { name: "Graphite", hex: "#1a1a1a", className: "bg-graphite" },
  { name: "Iris", hex: "#8d7cff", className: "bg-iris" },
  { name: "Lilas", hex: "#ba7eee", className: "bg-lilas" },
  { name: "Lime", hex: "#d1ff5e", className: "bg-lime" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1180px] flex-col gap-12 px-5 py-10 sm:px-12 sm:py-16">
      <header className="pg flex items-center justify-between">
        <Logotype height={44} priority />
        <span className="eyebrow">Portail</span>
      </header>

      <section className="pg2 flex flex-col gap-6">
        <p className="eyebrow flex items-center gap-2">
          <Logomark size={18} /> Espace apprentis
        </p>
        <h1 className="nr m-0 max-w-[16ch] text-[40px] leading-[1.05] sm:text-[56px]">
          Votre formation, au même endroit.
        </h1>
        <p className="m-0 max-w-[52ch] text-[17px] leading-relaxed text-texte">
          Cours, calendrier, ressources, travail à rendre, notes et messages : le portail
          de MLK Campus est en cours de construction.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btnA">
            Se connecter <span className="ar">→</span>
          </button>
          <button type="button" className="btnO">
            Mot de passe oublié
          </button>
        </div>
      </section>

      <section className="pg3 grid gap-4 sm:grid-cols-5" aria-label="Palette de la charte">
        {PALETTE.map((color) => (
          <div key={color.name} className="card lift overflow-hidden">
            <div className={`${color.className} h-20 border-b border-black/10`} />
            <div className="px-4 py-3">
              <p className="m-0 text-sm font-semibold">{color.name}</p>
              <p className="m-0 text-xs text-texte-doux">{color.hex}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
