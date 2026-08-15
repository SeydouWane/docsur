import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { PdfVersOfficeTool } from "@/components/pdf-vers-office-tool";

export const metadata: Metadata = {
  title: "PDF en Word — Aegis-Num",
  description: "Récupérez un document PDF sous forme de fichier Word éditable.",
};

export default function PdfVersWordPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Convertir depuis PDF · traitement serveur chiffré"
        titre="PDF en Word"
        description="Reconstruisez un document .docx éditable à partir d'un PDF. Traité par un service dédié, éphémère."
      />
      <div className="mt-10">
        <PdfVersOfficeTool mode="word" nomTelecharge="aegis-num.docx" />
      </div>
    </div>
  );
}
