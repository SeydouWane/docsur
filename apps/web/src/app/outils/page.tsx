import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { categories } from "@/lib/outils-catalogue";

export const metadata: Metadata = {
  title: "Tous les outils PDF — DocSur",
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

      <div className="mt-12 space-y-14">
        {categories.map((categorie) => (
          <section key={categorie.id} id={categorie.id} className="scroll-mt-24">
            <h2 className="font-display text-xl font-bold">{categorie.label}</h2>
            <p className="mt-1 text-sm text-muted">{categorie.description}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categorie.outils.map((outil) => (
                <ToolCard key={outil.slug} outil={outil} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
