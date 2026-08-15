"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  ScrollText,
  Wrench,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { clearToken, type Profil } from "@/lib/api";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };
type NavGroup = { titre?: string; items: NavItem[] };

const ROLE_LABEL: Record<Profil["role"], string> = {
  ADMIN: "Administrateur",
  MANAGER: "Manager",
  COLLABORATEUR: "Collaborateur",
  INVITE_EXTERNE: "Invité externe",
};

function construireNavigation(profil: Profil): NavGroup[] {
  const estAdminEntreprise = profil.role === "ADMIN" && profil.organisation.type === "ENTREPRISE";

  const items: NavItem[] = [{ href: "/tableau-de-bord", label: "Vue d'ensemble", icon: LayoutDashboard }];
  if (profil.estSuperAdmin) {
    items.push({ href: "/tableau-de-bord/organisations", label: "Organisations", icon: Building2 });
  }
  if (estAdminEntreprise) {
    items.push({ href: "/tableau-de-bord/equipe", label: "Équipe", icon: Users });
  }
  items.push({
    href: "/tableau-de-bord/documents",
    label: estAdminEntreprise || profil.estSuperAdmin ? "Documents" : "Mes documents",
    icon: FileText,
  });
  items.push({
    href: "/tableau-de-bord/journal",
    label: profil.estSuperAdmin ? "Journal plateforme" : estAdminEntreprise ? "Journal d'activité" : "Mon activité",
    icon: ScrollText,
  });

  const titre = profil.estSuperAdmin ? "Plateforme" : estAdminEntreprise ? profil.organisation.nom : undefined;

  return [
    { titre, items },
    { items: [{ href: "/outils", label: "Catalogue d'outils", icon: Wrench }] },
  ];
}

function initiales(nom: string): string {
  const parties = nom.trim().split(/\s+/);
  return ((parties[0]?.[0] ?? "") + (parties[1]?.[0] ?? "")).toUpperCase();
}

export function DashboardSidebar({ profil }: { profil: Profil }) {
  const pathname = usePathname();
  const router = useRouter();
  const groupes = construireNavigation(profil);

  const deconnecter = () => {
    clearToken();
    router.push("/connexion");
  };

  return (
    <aside className="w-full shrink-0 md:sticky md:top-20 md:h-[calc(100vh-6rem)] md:w-64">
      <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3 border-b border-border px-1 pb-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-bold text-accent">
            {initiales(profil.nom)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{profil.nom}</p>
            <p className="truncate text-xs text-muted">{ROLE_LABEL[profil.role]}</p>
          </div>
          {profil.estSuperAdmin && (
            <ShieldCheck size={16} className="ml-auto shrink-0 text-good" aria-label="Superadmin" />
          )}
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto py-4">
          {groupes.map((groupe, i) => (
            <div key={i}>
              {groupe.titre && (
                <p className="mb-2 truncate px-2 font-mono text-[11px] uppercase tracking-wider text-muted">
                  {groupe.titre}
                </p>
              )}
              <div className="space-y-0.5">
                {groupe.items.map((item) => {
                  const actif = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} className="relative block">
                      {actif && (
                        <motion.span
                          layoutId="sidebar-actif"
                          className="absolute inset-0 rounded-lg bg-accent-soft"
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                      <span
                        className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
                          actif ? "font-medium text-accent" : "text-muted hover:text-ink"
                        }`}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={deconnecter}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-muted hover:text-ink"
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
