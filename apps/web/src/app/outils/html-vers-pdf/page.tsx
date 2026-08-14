import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { HtmlVersPdfTool } from "./html-vers-pdf-tool";

export const metadata: Metadata = {
  title: "HTML en PDF — Aegis-Num",
  description: "Convertissez une page web en PDF à partir de son adresse.",
};

export default function HtmlVersPdfPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Convertir en PDF · traitement serveur chiffré"
        titre="HTML en PDF"
        description="Copiez-collez l'adresse d'une page web pour la convertir en PDF."
      />
      <div className="mt-10">
        <HtmlVersPdfTool />
      </div>
    </div>
  );
}
