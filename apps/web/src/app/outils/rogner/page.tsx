import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { RognerTool } from "./rogner-tool";

export const metadata: Metadata = {
  title: "Rogner un PDF — Aegis-Num",
  description: "Recadrez les marges d'un PDF, entièrement dans votre navigateur.",
};

export default function RognerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Modifier · traitement local"
        titre="Rogner un PDF"
        description="Recadrez les marges de chaque page. Tout se passe dans votre navigateur : aucun fichier n'est envoyé à un serveur."
      />
      <div className="mt-10">
        <RognerTool />
      </div>
    </div>
  );
}
