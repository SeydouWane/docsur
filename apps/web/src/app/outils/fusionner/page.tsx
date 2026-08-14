import type { Metadata } from "next";
import Link from "next/link";
import { MergeTool } from "./merge-tool";

export const metadata: Metadata = {
  title: "Fusionner un PDF — Aegis-Num",
  description:
    "Fusionnez plusieurs PDF en un seul document, entièrement dans votre navigateur : les fichiers ne quittent jamais votre poste.",
};

export default function FusionnerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/outils" className="text-sm text-muted hover:text-ink">
        ← Tous les outils
      </Link>
      <p className="mb-3 mt-4 font-mono text-xs uppercase tracking-wider text-accent">
        Organiser · traitement local
      </p>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Fusionner un PDF
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Ajoutez plusieurs fichiers, ordonnez-les, puis fusionnez. Tout se
        passe dans votre navigateur avec pdf-lib : aucun fichier n&apos;est
        envoyé à un serveur.
      </p>

      <div className="mt-10">
        <MergeTool />
      </div>
    </div>
  );
}
