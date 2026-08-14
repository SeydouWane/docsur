import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { SecuritePdfPasswordTool } from "@/components/securite-pdf-password-tool";

export const metadata: Metadata = {
  title: "Protéger un PDF — Aegis-Num",
  description: "Chiffrez un PDF avec un mot de passe d'ouverture (AES-256).",
};

export default function ProtegerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Sécurité · traitement serveur chiffré"
        titre="Protéger un PDF"
        description="Chiffrez le document avec un mot de passe d'ouverture (AES-256). Traité par un service dédié, éphémère."
      />
      <div className="mt-10">
        <SecuritePdfPasswordTool mode="proteger" nomTelecharge="aegis-num-protege.pdf" />
      </div>
    </div>
  );
}
