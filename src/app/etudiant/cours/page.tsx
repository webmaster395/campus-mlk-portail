import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Cours" };

export default function CoursesPage() {
  return (
    <ComingSoon
      title="Cours"
      description="Les modules de votre formation, leurs objectifs, leurs séances et leurs ressources."
    />
  );
}
