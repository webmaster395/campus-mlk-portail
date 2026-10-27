import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Calendrier" };

export default function CalendarPage() {
  return (
    <ComingSoon
      title="Calendrier"
      description="Vos séances au campus, vos évaluations et les événements de votre promotion, semaine par semaine."
    />
  );
}
