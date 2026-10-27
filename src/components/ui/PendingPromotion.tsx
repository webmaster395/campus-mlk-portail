import { Hourglass } from "lucide-react";
import EmptyState from "./EmptyState";

/** Compte pas encore rattaché à une promotion : rien à afficher dans les sections. */
export default function PendingPromotion() {
  return (
    <EmptyState icon={Hourglass} title="Votre compte est en attente de rattachement">
      L&apos;équipe de MLK Campus doit encore vous rattacher à votre promotion. Vos cours,
      votre calendrier et vos ressources apparaîtront ici dès que ce sera fait.
    </EmptyState>
  );
}
