import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { ReorganiserTool } from "./reorganiser-tool";

export const metadata: Metadata = {
  title: "Réorganiser les pages PDF — Aegis-Num",
  description: "Changez l'ordre des pages d'un PDF, entièrement dans votre navigateur.",
};

export default function ReorganiserPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Organiser · traitement local"
        titre="Réorganiser les pages"
        description="Changez l'ordre des pages, ou retirez-en. Tout se passe dans votre navigateur : aucun fichier n'est envoyé à un serveur."
      />
      <div className="mt-10">
        <ReorganiserTool />
      </div>
    </div>
  );
}
