"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { getToken } from "@/lib/api";

const NAV_LINKS = [
  { href: "/outils", label: "Outils" },
  { href: "/docs/specifications.html", label: "Spécifications" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [connecte, setConnecte] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    setConnecte(Boolean(getToken()));
  }, [pathname]);

  useEffect(() => {
    setMenuOuvert(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
          DocSur
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
          {connecte ? (
            <Link
              href="/tableau-de-bord"
              className="rounded-lg bg-accent px-3 py-1.5 text-accent-ink"
            >
              Tableau de bord
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="hover:text-ink">
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="rounded-lg bg-accent px-3 py-1.5 text-accent-ink"
              >
                Créer une organisation
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOuvert}
          onClick={() => setMenuOuvert((v) => !v)}
          className="rounded-lg border border-border p-2 text-ink md:hidden"
        >
          {menuOuvert ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {menuOuvert && (
        <nav className="flex flex-col gap-1 border-t border-border px-6 py-4 text-sm md:hidden">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-2 py-2 text-muted hover:bg-surface-2 hover:text-ink">
              {link.label}
            </Link>
          ))}
          {connecte ? (
            <Link href="/tableau-de-bord" className="rounded-lg px-2 py-2 font-medium text-accent">
              Tableau de bord
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="rounded-lg px-2 py-2 text-muted hover:bg-surface-2 hover:text-ink">
                Connexion
              </Link>
              <Link href="/inscription" className="rounded-lg px-2 py-2 font-medium text-accent">
                Créer une organisation
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
