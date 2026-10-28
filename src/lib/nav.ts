import {
  BookOpen,
  CalendarDays,
  FileText,
  FolderOpen,
  GraduationCap,
  House,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Pastille du nombre d'annonces non lues */
  showsUnread?: boolean;
};

export type NavSection = { title: string; items: NavItem[] };

/** Cookie du menu latéral replié (« 1 ») ou déplié, lu par la coquille côté serveur. */
export const SIDEBAR_COOKIE = "portail-menu-replie";

/** Le menu de l'espace étudiant (sidebar sur ordinateur, tiroir sur téléphone). */
export const STUDENT_NAV: NavSection[] = [
  {
    title: "Principal",
    items: [
      { label: "Accueil", href: "/etudiant", icon: House },
      { label: "Calendrier", href: "/etudiant/calendrier", icon: CalendarDays },
    ],
  },
  {
    title: "Ma formation",
    items: [
      { label: "Cours", href: "/etudiant/cours", icon: BookOpen },
      { label: "Ressources", href: "/etudiant/ressources", icon: FolderOpen },
      { label: "Travail à rendre", href: "/etudiant/travail", icon: FileText },
      { label: "Notes", href: "/etudiant/notes", icon: GraduationCap },
    ],
  },
  {
    title: "Vie du campus",
    items: [{ label: "Messages", href: "/etudiant/messages", icon: Megaphone, showsUnread: true }],
  },
];

/** Vrai si le lien du menu correspond à la page affichée (sous-pages comprises). */
export function isActive(href: string, pathname: string): boolean {
  if (href === "/etudiant") return pathname === "/etudiant";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Nom de la section affichée, pour l'en-tête. */
export function sectionTitle(pathname: string): string {
  if (pathname.startsWith("/etudiant/profil")) return "Mon profil";
  for (const section of STUDENT_NAV) {
    for (const item of section.items) if (isActive(item.href, pathname)) return item.label;
  }
  return "Portail";
}
