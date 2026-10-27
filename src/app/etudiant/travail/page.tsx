import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Travail à rendre" };

export default function AssignmentsPage() {
  return (
    <ComingSoon
      title="Travail à rendre"
      description="Vos devoirs, leurs échéances et vos rendus, avec le dépôt de fichiers."
    />
  );
}
