import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { PivoterTool } from "./pivoter-tool";

export const metadata: Metadata = {
  title: "Faire pivoter un PDF — Aegis-Num",
  description: "Corrigez l'orientation d'une ou plusieurs pages, entièrement dans votre navigateur.",
};

export default function PivoterPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Modifier · traitement local"
        titre="Faire pivoter un PDF"
        description="Corrigez l'orientation d'une ou plusieurs pages. Tout se passe dans votre navigateur : aucun fichier n'est envoyé à un serveur."
      />
      <div className="mt-10">
        <PivoterTool />
      </div>
    </div>
  );
}
