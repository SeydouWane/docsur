import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { PdfVersJpgTool } from "./pdf-vers-jpg-tool";

export const metadata: Metadata = {
  title: "PDF en JPG — Aegis-Num",
  description: "Exportez les pages d'un PDF en images JPG, entièrement dans votre navigateur.",
};

export default function PdfVersJpgPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Convertir depuis PDF · traitement local"
        titre="PDF en JPG"
        description="Exportez chaque page en image JPG. Tout se passe dans votre navigateur : aucun fichier n'est envoyé à un serveur."
      />
      <div className="mt-10">
        <PdfVersJpgTool />
      </div>
    </div>
  );
}
