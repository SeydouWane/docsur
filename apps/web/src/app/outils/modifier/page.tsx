import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { ModifierTool } from "./modifier-tool";

export const metadata: Metadata = {
  title: "Modifier un PDF — Aegis-Num",
  description: "Ajoutez du texte ou des images directement sur un PDF, entièrement dans votre navigateur.",
};

export default function ModifierPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <ToolPageHeader
        categorie="Modifier · traitement local"
        titre="Modifier un PDF"
        description="Ajoutez du texte ou des images directement sur le document. Tout se passe dans votre navigateur : aucun fichier n'est envoyé à un serveur."
      />
      <div className="mt-10">
        <ModifierTool />
      </div>
    </div>
  );
}
