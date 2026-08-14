import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { SecuritePdfPasswordTool } from "@/components/securite-pdf-password-tool";

export const metadata: Metadata = {
  title: "Déverrouiller un PDF — Aegis-Num",
  description: "Retirez le mot de passe d'un PDF dont vous disposez déjà.",
};

export default function DeverrouillerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Sécurité · traitement serveur chiffré"
        titre="Déverrouiller un PDF"
        description="Retirez le mot de passe d'un document dont vous disposez déjà. Traité par un service dédié, éphémère."
      />
      <div className="mt-10">
        <SecuritePdfPasswordTool mode="deverrouiller" nomTelecharge="aegis-num-deverrouille.pdf" />
      </div>
    </div>
  );
}
