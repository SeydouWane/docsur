import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { ExtrairePagesTool } from "./extraire-pages-tool";

export const metadata: Metadata = {
  title: "Extraire des pages PDF — Aegis-Num",
  description: "Isolez une sélection de pages dans un nouveau PDF, entièrement dans votre navigateur.",
};

export default function ExtrairePagesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Organiser · traitement local"
        titre="Extraire des pages"
        description="Isolez une sélection de pages dans un nouveau document. Tout se passe dans votre navigateur : aucun fichier n'est envoyé à un serveur."
      />
      <div className="mt-10">
        <ExtrairePagesTool />
      </div>
    </div>
  );
}
