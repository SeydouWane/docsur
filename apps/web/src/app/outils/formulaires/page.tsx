import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { FormulairesTool } from "./formulaires-tool";

export const metadata: Metadata = {
  title: "Formulaires PDF — Aegis-Num",
  description: "Créez des champs de formulaire remplissables sur un PDF, entièrement dans votre navigateur.",
};

export default function FormulairesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <ToolPageHeader
        categorie="Formulaires · traitement local"
        titre="Formulaires PDF"
        description="Placez des champs texte et des cases à cocher remplissables. Tout se passe dans votre navigateur : aucun fichier n'est envoyé à un serveur."
      />
      <div className="mt-10">
        <FormulairesTool />
      </div>
    </div>
  );
}
