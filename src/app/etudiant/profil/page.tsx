import type { Metadata } from "next";
import { Briefcase, CalendarRange, GraduationCap, Mail } from "lucide-react";
import AvatarUploader from "@/components/profile/AvatarUploader";
import PasswordForm from "@/components/profile/PasswordForm";
import Avatar from "@/components/ui/Avatar";
import FormSubmitButton from "@/components/ui/FormSubmitButton";
import PageHeader from "@/components/ui/PageHeader";
import { SUPPORT_EMAIL } from "@/lib/auth-messages";
import { formatDayTitle } from "@/lib/calendar";
import { getViewer } from "@/lib/data/viewer";
import { removeAvatar } from "./actions";

export const metadata: Metadata = { title: "Mon profil" };

/** Identité, formation et entreprise (gérées par le CFA), photo et mot de passe. */
export default async function ProfilePage() {
  const viewer = await getViewer();
  if (!viewer) return null;

  const rows = [
    { icon: Mail, label: "Adresse e-mail", value: viewer.email },
    { icon: GraduationCap, label: "Formation", value: viewer.formation?.title ?? "En attente de rattachement" },
    {
      icon: CalendarRange,
      label: "Promotion",
      value: viewer.promotion
        ? `${viewer.promotion.label} · du ${formatDayTitle(viewer.promotion.startsOn).toLowerCase()} au ${formatDayTitle(viewer.promotion.endsOn).toLowerCase()}`
        : "En attente de rattachement",
    },
    { icon: Briefcase, label: "Entreprise d'accueil", value: viewer.companyName ?? "Non renseignée" },
  ];

  return (
    <>
      <PageHeader eyebrow="Espace apprentis" title="Mon profil">
        Vos informations au sein de MLK Campus.
      </PageHeader>

      <div className="pg2 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="card flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar name={viewer.fullName} size={88} src={viewer.avatarUrl} />
            <div className="min-w-0">
              <h2 className="nr m-0 text-[26px] leading-tight">{viewer.fullName}</h2>
              <p className="mt-1 mb-0 text-[14px] text-texte-doux">En apprentissage à MLK Campus</p>
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <AvatarUploader userId={viewer.id} hasAvatar={!!viewer.avatarPath} />
            {viewer.avatarPath && (
              <form action={removeAvatar}>
                <FormSubmitButton className="btnO !px-5 !py-2.5 text-[13.5px]" pendingLabel="Retrait…">
                  Retirer la photo
                </FormSubmitButton>
              </form>
            )}
          </div>
          <p className="m-0 text-[12.5px] text-texte-doux">JPEG, PNG ou WebP · 2 Mo maximum. Elle apparaît dans votre menu.</p>
        </section>

        <section className="card p-6">
          <h2 className="mt-0 mb-4 text-[16px] font-semibold">Mes informations</h2>
          <dl className="m-0 flex flex-col divide-y divide-black/[0.07]">
            {rows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 py-3 first:pt-0">
                <Icon size={17} aria-hidden className="mt-0.5 shrink-0 text-iris" />
                <div className="min-w-0">
                  <dt className="text-[12.5px] text-texte-doux">{label}</dt>
                  <dd className="m-0 text-[15px] font-medium break-words">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="mt-4 mb-0 text-[13px] leading-relaxed text-texte-doux">
            Une information à corriger&nbsp;? Écrivez à{" "}
            <a className="font-semibold text-graphite underline decoration-iris/50 underline-offset-4" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </section>

        <section className="card p-6 lg:col-span-2">
          <h2 className="mt-0 mb-1 text-[16px] font-semibold">Mot de passe</h2>
          <p className="mt-0 mb-5 text-[14px] text-texte-doux">Pour le changer, confirmez d&apos;abord votre mot de passe actuel.</p>
          <div className="max-w-[640px]">
            <PasswordForm />
          </div>
        </section>
      </div>
    </>
  );
}
