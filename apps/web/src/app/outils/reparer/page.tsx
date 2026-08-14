import type { Metadata } from "next";
import { ToolPageHeader } from "@/components/tool-page-header";
import { ReparerTool } from "./reparer-tool";

export const metadata: Metadata = {
  title: "Réparer un PDF — Aegis-Num",
  description: "Reconstruisez un PDF corrompu ou qui ne s'ouvre plus.",
};

export default function ReparerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <ToolPageHeader
        categorie="Optimiser · traitement serveur chiffré"
        titre="Réparer un PDF"
        description="Reconstruisez un document corrompu ou qui ne s'ouvre plus. Traité par un service dédié, éphémère."
      />
      <div className="mt-10">
        <ReparerTool />
      </div>
    </div>
  );
}
