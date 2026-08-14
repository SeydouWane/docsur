import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { OfficeVersPdfTool } from "@/components/office-vers-pdf-tool";

export const metadata: Metadata = {
  title: "PowerPoint en PDF — Aegis-Num",
  description: "Convertissez une présentation PowerPoint en PDF prêt à partager.",
};

export default function PowerpointVersPdfPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Convertir en PDF · traitement serveur chiffré"
        titre="PowerPoint en PDF"
        description="Convertissez une présentation (.ppt, .pptx, .odp) en PDF prêt à partager."
      />
      <div className="mt-10">
        <OfficeVersPdfTool
          accept=".ppt,.pptx,.odp"
          texte="Glissez une présentation ici, ou cliquez pour la choisir"
        />
      </div>
    </div>
  );
}
