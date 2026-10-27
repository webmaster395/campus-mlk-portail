import { Construction } from "lucide-react";
import EmptyState from "./EmptyState";
import PageHeader from "./PageHeader";

/** Page de section pas encore construite (étape 3 : la navigation est en place). */
export default function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <PageHeader eyebrow="Espace apprentis" title={title}>
        {description}
      </PageHeader>
      <EmptyState icon={Construction} title="Cette section arrive bientôt">
        Elle est en cours de construction. Vous la retrouverez ici dès qu&apos;elle sera prête.
      </EmptyState>
    </>
  );
}
