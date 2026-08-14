import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { SupprimerPagesTool } from "./supprimer-pages-tool";

export const metadata: Metadata = {
  title: "Supprimer des pages PDF — Aegis-Num",
  description: "Retirez une ou plusieurs pages d'un PDF, entièrement dans votre navigateur.",
};

export default function SupprimerPagesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Organiser · traitement local"
        titre="Supprimer des pages"
        description="Retirez une ou plusieurs pages d'un document existant. Tout se passe dans votre navigateur : aucun fichier n'est envoyé à un serveur."
      />
      <div className="mt-10">
        <SupprimerPagesTool />
      </div>
    </div>
  );
}
