import Link from "next/link";
import { categories } from "@/lib/outils-catalogue";
import { Logo } from "./logo";

const BADGES = ["Chiffrement AES-256", "Signature PAdES open source", "Purge automatique", "Journal d'audit"];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Logo size={26} />
            <p className="mt-3 max-w-xs text-sm text-muted">
              Le bouclier numérique de vos documents d&apos;entreprise — la
              simplicité d&apos;un outil PDF grand public, avec la maîtrise et
              la traçabilité qu&apos;exige un RSSI.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted">Outils</p>
            <ul className="mt-3 space-y-2 text-sm">
              {categories.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <Link href={`/outils#${c.id}`} className="text-muted hover:text-ink">
                    {c.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/outils" className="text-accent">
                  Tous les outils →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted">Ressources</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="/docs/specifications.html" className="text-muted hover:text-ink">
                  Dossier de spécifications
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/SeydouWane/docsur"
                  className="text-muted hover:text-ink"
                >
                  Code source
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted">Compte</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/connexion" className="text-muted hover:text-ink">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="text-muted hover:text-ink">
                  Créer une organisation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Aegis-Num. Plateforme documentaire B2B.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {BADGES.map((b) => (
              <li key={b} className="font-mono text-[11px] text-muted">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
