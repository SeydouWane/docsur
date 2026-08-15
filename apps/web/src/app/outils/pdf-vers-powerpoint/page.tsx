import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { PdfVersOfficeTool } from "@/components/pdf-vers-office-tool";

export const metadata: Metadata = {
  title: "PDF en PowerPoint — Aegis-Num",
  description: "Récupérez un PDF sous forme de présentation éditable.",
};

export default function PdfVersPowerpointPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Convertir depuis PDF · traitement serveur chiffré"
        titre="PDF en PowerPoint"
        description="Reconstruisez une présentation .pptx éditable à partir d'un PDF. Traité par un service dédié, éphémère."
      />
      <div className="mt-10">
        <PdfVersOfficeTool mode="powerpoint" nomTelecharge="aegis-num.pptx" />
      </div>
    </div>
  );
}
