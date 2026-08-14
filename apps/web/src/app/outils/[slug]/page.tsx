import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { trouverOutil } from "@/lib/outils-catalogue";
import { ToolPlaceholder } from "./placeholder";

export async function generateMetadata(props: PageProps<"/outils/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const outil = trouverOutil(slug);
  if (!outil) return {};
  return {
    title: `${outil.nom} — Aegis-Num`,
    description: outil.description,
  };
}

export default async function OutilPage(props: PageProps<"/outils/[slug]">) {
  const { slug } = await props.params;
  if (!trouverOutil(slug)) notFound();

  return <ToolPlaceholder slug={slug} />;
}
