"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { getToken } from "@/lib/api";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/outils", label: "Outils" },
  { href: "/docs/specifications.html", label: "Spécifications" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="group relative py-1 hover:text-ink">
      {label}
      <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-accent transition-transform duration-200 group-hover:scale-x-100" />
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [connecte, setConnecte] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Synchronise avec deux sources externes à chaque navigation : le token
    // en localStorage (inaccessible pendant le rendu serveur, donc pas
    // dérivable au rendu) et la fermeture du menu mobile.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture localStorage, pas de source dérivable au rendu
    setConnecte(Boolean(getToken()));
    setMenuOuvert(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-bg/85 backdrop-blur transition-shadow duration-300 supports-backdrop-filter:bg-bg/70 ${
        scrolled ? "border-border shadow-sm" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          {connecte ? (
            <Link href="/tableau-de-bord">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block rounded-lg bg-accent px-3 py-1.5 text-accent-ink"
              >
                Tableau de bord
              </motion.span>
            </Link>
          ) : (
            <>
              <NavLink href="/connexion" label="Connexion" />
              <Link href="/inscription">
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block rounded-lg bg-accent px-3 py-1.5 text-accent-ink"
                >
                  Créer une organisation
                </motion.span>
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOuvert}
            onClick={() => setMenuOuvert((v) => !v)}
            className="rounded-lg border border-border p-2 text-ink"
          >
            {menuOuvert ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOuvert && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-2 py-2 text-muted hover:bg-surface-2 hover:text-ink"
                >
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
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
