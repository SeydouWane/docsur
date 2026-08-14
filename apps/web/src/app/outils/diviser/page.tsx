import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { DiviserTool } from "./diviser-tool";

export const metadata: Metadata = {
  title: "Diviser un PDF — Aegis-Num",
  description: "Séparez un PDF en plusieurs fichiers, par plage de pages, entièrement dans votre navigateur.",
};

export default function DiviserPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Organiser · traitement local"
        titre="Diviser un PDF"
        description="Séparez un document en plusieurs PDF, par plage de pages. Tout se passe dans votre navigateur : aucun fichier n'est envoyé à un serveur."
      />
      <div className="mt-10">
        <DiviserTool />
      </div>
    </div>
  );
}
