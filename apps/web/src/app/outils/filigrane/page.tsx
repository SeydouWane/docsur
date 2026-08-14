import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { FiligraneTool } from "./filigrane-tool";

export const metadata: Metadata = {
  title: "Ajouter un filigrane — Aegis-Num",
  description: "Posez un texte en surimpression sur chaque page d'un PDF, entièrement dans votre navigateur.",
};

export default function FiligranePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Modifier · traitement local"
        titre="Ajouter un filigrane"
        description="Posez un texte en surimpression sur chaque page — taille, opacité et rotation au choix. Tout se passe dans votre navigateur."
      />
      <div className="mt-10">
        <FiligraneTool />
      </div>
    </div>
  );
}
