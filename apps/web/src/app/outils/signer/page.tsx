import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { SignerTool } from "./signer-tool";

export const metadata: Metadata = {
  title: "Signer un PDF — Aegis-Num",
  description: "Signature électronique PAdES, sur chaîne open source auto-hébergée.",
};

export default function SignerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Sécurité · signature électronique"
        titre="Signer un PDF"
        description="Positionnez votre signature directement sur le document. Traité par une chaîne cryptographique dédiée : certificat émis par notre autorité de certification interne, horodatage RFC 3161."
      />
      <div className="mt-10">
        <SignerTool />
      </div>
    </div>
  );
}
