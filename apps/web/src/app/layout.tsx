import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const jbmono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "DocSur — documents d'entreprise, en sécurité",
  description:
    "DocSur permet aux entreprises de fusionner, convertir et faire signer leurs PDF sans les exposer à des outils grand public non contractualisés.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jakarta.variable} ${jbmono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
              DocSur
            </Link>
            <nav className="flex items-center gap-6 text-sm text-muted">
              <Link href="/outils/fusionner" className="hover:text-ink">
                Fusionner un PDF
              </Link>
              <a href="/docs/specifications.html" className="hover:text-ink">
                Spécifications
              </a>
              <Link href="/connexion" className="hover:text-ink">
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="rounded-lg bg-accent px-3 py-1.5 text-accent-ink"
              >
                Créer une organisation
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-muted">
            DocSur — plateforme documentaire B2B. Traitement local quand c&apos;est possible, chiffré et journalisé quand ce ne l&apos;est pas.
          </div>
        </footer>
      </body>
    </html>
  );
}
