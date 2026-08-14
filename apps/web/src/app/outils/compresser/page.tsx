import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { CompresserTool } from "./compresser-tool";

export const metadata: Metadata = {
  title: "Compresser un PDF — Aegis-Num",
  description: "Réduisez la taille d'un PDF en conservant une qualité lisible.",
};

export default function CompresserPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Optimiser · traitement serveur chiffré"
        titre="Compresser un PDF"
        description="Réduisez la taille du fichier en conservant le texte et la qualité. Traité par un service dédié, éphémère."
      />
      <div className="mt-10">
        <CompresserTool />
      </div>
    </div>
  );
}
