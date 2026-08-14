import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { CensurerTool } from "./censurer-tool";

export const metadata: Metadata = {
  title: "Censurer un PDF — Aegis-Num",
  description: "Supprimez définitivement un contenu sensible d'un PDF, pas seulement le masquer.",
};

export default function CensurerPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <ToolPageHeader
        categorie="Sécurité · traitement local"
        titre="Censurer un PDF"
        description="Supprimez définitivement un contenu sensible — le texte et les images sous la zone sont réellement effacés, pas seulement recouverts. Tout se passe dans votre navigateur."
      />
      <div className="mt-10">
        <CensurerTool />
      </div>
    </div>
  );
}
