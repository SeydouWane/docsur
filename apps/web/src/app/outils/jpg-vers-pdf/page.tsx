import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { JpgVersPdfTool } from "./jpg-vers-pdf-tool";

export const metadata: Metadata = {
  title: "JPG en PDF — Aegis-Num",
  description: "Regroupez une ou plusieurs images dans un PDF, entièrement dans votre navigateur.",
};

export default function JpgVersPdfPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Convertir en PDF · traitement local"
        titre="JPG en PDF"
        description="Regroupez une ou plusieurs images dans un PDF, dans l'ordre voulu. Tout se passe dans votre navigateur."
      />
      <div className="mt-10">
        <JpgVersPdfTool />
      </div>
    </div>
  );
}
