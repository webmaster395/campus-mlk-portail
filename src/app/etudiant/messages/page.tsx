import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <ComingSoon
      title="Messages"
      description="Les annonces de l'équipe de MLK Campus et de vos formateurs."
    />
  );
}
