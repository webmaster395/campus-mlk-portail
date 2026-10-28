import Image from "next/image";
import Logomark from "@/components/brand/Logomark";
import Logotype from "@/components/brand/Logotype";

/**
 * Habillage des pages de compte (connexion, mot de passe…) : un panneau graphite aux
 * couleurs de MLK Campus, et le contenu sur fond porcelaine. Sur mobile, le panneau se
 * réduit à un bandeau avec le logotype.
 */
export default function AuthShell({
  tagline = "Votre formation, au même endroit.",
  photo,
  children,
}: {
  tagline?: string;
  /** Photo d'ambiance du panneau (ordinateur) ; position = object-position pour cadrer la personne. */
  photo?: { src: string; position?: string };
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-porcelaine lg:h-dvh lg:grid-cols-2 lg:grid-rows-1">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-graphite px-5 py-5 text-porcelaine sm:px-10 lg:px-14 lg:py-12">
        {photo && (
          <>
            <Image
              src={photo.src}
              alt=""
              fill
              priority
              sizes="50vw"
              className="pointer-events-none hidden object-cover lg:block"
              style={{ objectPosition: photo.position ?? "center" }}
            />
            {/* Voile graphite : garde le texte blanc lisible sur la photo */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-graphite/90 via-graphite/55 to-graphite/80 lg:block"
            />
          </>
        )}

        {/* Enveloppé : la colonne flex étirerait l'image en largeur */}
        <div className="relative z-10 self-start">
          <div className="lg:hidden">
            <Logotype variant="blanc" height={52} priority />
          </div>
          <div className="hidden lg:block">
            <Logotype variant="blanc" height={84} priority />
          </div>
        </div>

        <div className="relative z-10 hidden max-w-[440px] lg:block">
          <p className="eyebrow m-0 !text-lime">Portail des apprentis</p>
          <p className="nr mt-5 mb-0 text-[52px] leading-[1.04]">{tagline}</p>
          <p className="mt-6 mb-0 text-[15px] leading-relaxed text-white/70">
            Calendrier, cours, ressources, travail à rendre, notes et messages de MLK Campus.
          </p>
        </div>

        <p className="relative z-10 m-0 hidden text-xs text-white/50 lg:block">
          MLK Campus · CFA à Créteil
        </p>

        {/* Logomark officiel en filigrane, sans le redessiner */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -right-28 -bottom-28 hidden opacity-[0.16] ${photo ? "" : "lg:block"}`}
        >
          <Logomark size={460} variant="principal" priority />
        </div>
      </aside>

      <main className="flex items-start justify-center px-5 py-6 sm:px-10 lg:items-center lg:overflow-y-auto lg:py-6">
        <div className="pg w-full max-w-[440px]">{children}</div>
      </main>
    </div>
  );
}
