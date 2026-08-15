import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { categories, couleurCategorie } from "@/lib/outils-catalogue";

export const metadata: Metadata = {
  title: "Tous les outils PDF — Aegis-Num",
  description:
    "Organiser, convertir, modifier et sécuriser vos PDF — chaque outil précise s'il traite le fichier localement ou via un pipeline serveur chiffré.",
};

export default function OutilsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="mb-3 font-mono text-xs uppercase tracking-wider text-accent">
        Pilier 3 · boîte à outils
      </p>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Tous les outils PDF
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Chaque carte précise si le fichier reste sur votre poste (traitement
        local) ou transite par un pipeline chiffré et éphémère (traitement
        serveur) — voir le détail dans le{" "}
        <a href="/docs/specifications.html" className="text-accent">
          dossier de spécifications
        </a>
        .
      </p>

      <nav className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => {
          const couleur = couleurCategorie(c.outils[0]?.slug ?? "");
          return (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-accent/40 hover:text-ink"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${couleur})` }} />
              {c.label}
            </a>
          );
        })}
      </nav>

      <div className="mt-10 space-y-14">
        {categories.map((categorie) => {
          const couleur = couleurCategorie(categorie.outils[0]?.slug ?? "");
          return (
            <section key={categorie.id} id={categorie.id} className="scroll-mt-24">
              <Reveal className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `var(--${couleur})` }} />
                <h2 className="font-display text-xl font-bold">{categorie.label}</h2>
              </Reveal>
              <Reveal className="mt-1 pl-4.5 text-sm text-muted">{categorie.description}</Reveal>
              <RevealGroup className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categorie.outils.map((outil) => (
                  <RevealItem key={outil.slug}>
                    <ToolCard slug={outil.slug} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </section>
          );
        })}
      </div>
    </div>
  );
}
