import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Notes" };

export default function GradesPage() {
  return (
    <ComingSoon
      title="Notes"
      description="Vos résultats aux évaluations publiées, module par module, avec les commentaires de vos formateurs."
    />
  );
}
