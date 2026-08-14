import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { OfficeVersPdfTool } from "@/components/office-vers-pdf-tool";

export const metadata: Metadata = {
  title: "Excel en PDF — Aegis-Num",
  description: "Convertissez un classeur Excel en PDF, feuilles et mise en page conservées.",
};

export default function ExcelVersPdfPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Convertir en PDF · traitement serveur chiffré"
        titre="Excel en PDF"
        description="Convertissez un classeur (.xls, .xlsx, .ods) en PDF, feuilles et mise en page conservées."
      />
      <div className="mt-10">
        <OfficeVersPdfTool
          accept=".xls,.xlsx,.ods"
          texte="Glissez un classeur Excel ici, ou cliquez pour le choisir"
        />
      </div>
    </div>
  );
}
