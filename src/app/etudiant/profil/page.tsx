import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Mon profil" };

export default function ProfilePage() {
  return (
    <ComingSoon
      title="Mon profil"
      description="Votre identité, votre formation, votre entreprise d'accueil, votre photo et votre mot de passe."
    />
  );
}
