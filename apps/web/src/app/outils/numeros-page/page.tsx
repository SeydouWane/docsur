import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { NumerosPageTool } from "./numeros-page-tool";

export const metadata: Metadata = {
  title: "Ajouter des numéros de page — Aegis-Num",
  description: "Numérotez les pages d'un PDF : position, format et point de départ au choix.",
};

export default function NumerosPagePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Modifier · traitement local"
        titre="Ajouter des numéros de page"
        description="Numérotez les pages : position, format et point de départ au choix. Tout se passe dans votre navigateur."
      />
      <div className="mt-10">
        <NumerosPageTool />
      </div>
    </div>
  );
}
