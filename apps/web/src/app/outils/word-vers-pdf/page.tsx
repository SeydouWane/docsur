import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { OfficeVersPdfTool } from "@/components/office-vers-pdf-tool";

export const metadata: Metadata = {
  title: "Word en PDF — Aegis-Num",
  description: "Convertissez un document Word en PDF, mise en page conservée.",
};

export default function WordVersPdfPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Convertir en PDF · traitement serveur chiffré"
        titre="Word en PDF"
        description="Convertissez un document Word (.doc, .docx, .odt, .rtf) en PDF, mise en page conservée."
      />
      <div className="mt-10">
        <OfficeVersPdfTool
          accept=".doc,.docx,.odt,.rtf"
          texte="Glissez un document Word ici, ou cliquez pour le choisir"
        />
      </div>
    </div>
  );
}
