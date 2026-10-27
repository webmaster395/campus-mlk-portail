import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Ressources" };

export default function ResourcesPage() {
  return (
    <ComingSoon
      title="Ressources"
      description="Supports de cours, documents et liens utiles partagés par vos formateurs."
    />
  );
}
