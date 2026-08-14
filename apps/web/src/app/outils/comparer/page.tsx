import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { ComparerTool } from "./comparer-tool";

export const metadata: Metadata = {
  title: "Comparer deux PDF — Aegis-Num",
  description: "Repérez les différences visuelles entre deux versions d'un même document, entièrement dans votre navigateur.",
};

export default function ComparerPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <ToolPageHeader
        categorie="Sécurité · traitement local"
        titre="Comparer deux PDF"
        description="Repérez les différences visuelles, page par page, entre deux versions d'un même document. Tout se passe dans votre navigateur."
      />
      <div className="mt-10">
        <ComparerTool />
      </div>
    </div>
  );
}
