"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STUDENT_NAV, isActive } from "@/lib/nav";

/**
 * Liens de navigation du menu latéral :
 * - Icônes calibrées à 22 px (déplié) et 23 px (replié) pour un équilibre optique idéal
 * - Replié : icône centrée dans un carré arrondi de 40px, fond doux si actif
 * - Déplié : fond doux arrondi sur toute la ligne si actif
 */
export default function NavLinks({
  unread,
  collapsed = false,
}: {
  unread: number;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className={`flex flex-col ${collapsed ? "gap-2" : "gap-6"}`}>
      {STUDENT_NAV.map((section, index) => (
        <div key={section.title}>
          {collapsed ? (
            index > 0 && <div className="mx-2.5 my-2 border-t border-black/[0.08]" aria-hidden />
          ) : (
            <p className="px-3 mb-2 text-[11px] font-medium tracking-[0.16em] text-[#8b918e] uppercase whitespace-nowrap">
              {section.title}
            </p>
          )}
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {section.items.map((item) => {
              const active = isActive(item.href, pathname);
              const Icon = item.icon;
              const badge = item.showsUnread && unread > 0 ? unread : 0;
              const unreadText = badge > 0 ? ` (${badge} non lue${badge > 1 ? "s" : ""})` : "";

              if (collapsed) {
                return (
                  <li key={item.href} className="flex justify-center">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={`${item.label}${unreadText}`}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-[8px] transition-colors ${
                        active
                          ? "bg-black/[0.07] text-graphite"
                          : "text-[#8b918e] hover:bg-black/[0.04] hover:text-graphite"
                      }`}
                    >
                      <Icon size={23} strokeWidth={1.65} aria-hidden />
                      {badge > 0 && (
                        <span
                          aria-hidden
                          className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2 border-white bg-iris"
                        />
                      )}
                      <span className="sr-only">
                        {item.label}
                        {unreadText}
                      </span>
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-[11px] rounded-[8px] px-3 py-2.5 text-[15px] transition-colors ${
                      active
                        ? "bg-black/[0.07] font-medium text-graphite"
                        : "text-[#4b524f] hover:bg-black/[0.04] hover:text-graphite"
                    }`}
                  >
                    <span className={`shrink-0 ${active ? "text-graphite" : "text-[#8b918e]"}`}>
                      <Icon size={22} strokeWidth={1.65} aria-hidden />
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {badge > 0 && (
                      <span className="rounded-full bg-iris px-2 py-0.5 text-[11px] font-bold text-white">
                        {badge}
                        <span className="sr-only"> non lue{badge > 1 ? "s" : ""}</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
