import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { NumeriserTool } from "./numeriser-tool";

export const metadata: Metadata = {
  title: "Numériser au format PDF — Aegis-Num",
  description: "Transformez des photos de documents en PDF net, entièrement dans votre navigateur.",
};

export default function NumeriserPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Organiser · traitement local"
        titre="Numériser au format PDF"
        description="Prenez vos documents en photo et obtenez un PDF net, avec contraste amélioré. Tout se passe dans votre navigateur."
      />
      <div className="mt-10">
        <NumeriserTool />
      </div>
    </div>
  );
}
