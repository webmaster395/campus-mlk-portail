"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STUDENT_NAV, isActive } from "@/lib/nav";

/** Les sections du menu, avec l'entrée active et la pastille des annonces non lues. */
export default function NavLinks({ unread }: { unread: number }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-7">
      {STUDENT_NAV.map((section) => (
        <div key={section.title}>
          <p className="mx-3 mb-2 text-[11px] font-semibold tracking-[0.12em] text-white/45 uppercase">
            {section.title}
          </p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {section.items.map((item) => {
              const active = isActive(item.href, pathname);
              const Icon = item.icon;
              const badge = item.showsUnread && unread > 0 ? unread : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[14.5px] font-medium transition-colors ${
                      active ? "bg-white/[0.09] text-white" : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    {active && (
                      <span aria-hidden className="absolute top-2.5 bottom-2.5 left-0 w-[3px] rounded-full bg-lime" />
                    )}
                    <Icon
                      size={19}
                      strokeWidth={1.7}
                      aria-hidden
                      className={active ? "text-lime" : "text-white/55 group-hover:text-white"}
                    />
                    <span className="flex-1">{item.label}</span>
                    {badge > 0 && (
                      <span className="rounded-full bg-lime px-2 py-0.5 text-[11.5px] font-bold text-graphite">
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
