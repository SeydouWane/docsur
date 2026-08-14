import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { OcrTool } from "./ocr-tool";

export const metadata: Metadata = {
  title: "OCR PDF — Aegis-Num",
  description: "Rendez un PDF scanné sélectionnable, copiable et indexable.",
};

export default function OcrPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Optimiser · traitement serveur chiffré"
        titre="OCR PDF"
        description="Ajoutez une couche de texte reconnu sous chaque page scannée. Traité par un service dédié, éphémère — la mise en page d'origine n'est jamais modifiée."
      />
      <div className="mt-10">
        <OcrTool />
      </div>
    </div>
  );
}
