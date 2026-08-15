import Image from "next/image";
import Link from "next/link";
import { UploadCloud, ShieldCheck, Share2, Lock, ScrollText, PenLine, FileStack } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { Hero } from "@/components/hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { trouverOutil } from "@/lib/outils-catalogue";

const points = [
  { icon: FileStack, texte: "Le fichier ne quitte pas le poste pour fusionner, diviser ou pivoter." },
  { icon: Lock, texte: "Tout traitement serveur est chiffré, éphémère et purgé automatiquement." },
  { icon: ScrollText, texte: "Chaque action est journalisée — qui, quoi, quand." },
  { icon: PenLine, texte: "Signature électronique sur chaîne open source, auto-hébergée." },
];

const pillars = [
  {
    k: "Pilier 1",
    title: "Console administrateur",
    body: "Enrôlement par domaine, MFA, rôles, journal d'audit exportable.",
  },
  {
    k: "Pilier 2",
    title: "Espace collaboratif sécurisé",
    body: "Partage interne, liens à expiration, circuit de validation, signature.",
  },
  {
    k: "Pilier 3",
    title: "Boîte à outils PDF",
    body: "Fusion, conversion, OCR, censure réelle — traitées au plus près de la donnée.",
  },
];

const etapes = [
  {
    n: "01",
    icon: UploadCloud,
    titre: "Déposez vos fichiers",
    texte: "Glissez un ou plusieurs PDF, images ou documents bureautiques — aucune installation.",
  },
  {
    n: "02",
    icon: ShieldCheck,
    titre: "Traitement local ou chiffré",
    texte: "Fusion, rotation, protection : dans votre navigateur. Le reste : pipeline chiffré et éphémère.",
  },
  {
    n: "03",
    icon: Share2,
    titre: "Téléchargez ou partagez",
    texte: "Récupérez le résultat, ou envoyez un lien à expiration — tout est journalisé.",
  },
];

const secteurs = [
  { nom: "Finance", detail: "Notes de frais, contrats fournisseurs, rapprochements — protégés et tracés." },
  { nom: "Ressources humaines", detail: "Contrats de travail, bulletins, dossiers du personnel signés en ligne." },
  { nom: "Juridique", detail: "Actes, avenants, procédures — signature PAdES et piste d'audit complète." },
  { nom: "Santé & social", detail: "Documents patients sensibles, jamais exposés à un outil grand public." },
];

const outilsEnAvant = ["fusionner", "compresser", "word-vers-pdf", "pdf-vers-word", "proteger", "signer"]
  .map(trouverOutil)
  .filter((o): o is NonNullable<typeof o> => Boolean(o));

export default function Home() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-6">
        <Hero />
      </div>

      <section className="border-y border-border bg-surface-2/60">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <RevealGroup className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {points.map((p) => (
              <RevealItem key={p.texte} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <p.icon size={17} strokeWidth={1.75} />
                </span>
                <p className="text-sm text-muted">{p.texte}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <section className="border-b border-border py-16">
          <Reveal>
            <h2 className="font-display text-2xl font-bold">Comment ça marche</h2>
          </Reveal>
          <RevealGroup className="mt-8 grid gap-8 md:grid-cols-3">
            {etapes.map((e) => (
              <RevealItem key={e.n}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-accent">{e.n}</span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <e.icon size={18} strokeWidth={1.75} />
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold">{e.titre}</h3>
                <p className="mt-1.5 text-sm text-muted">{e.texte}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="border-b border-border py-16">
          <Reveal className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">La boîte à outils</h2>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Tout ce que vous faites déjà sur un outil PDF grand public — en
                gardant le contrôle sur vos documents.
              </p>
            </div>
            <Link href="/outils" className="hidden text-sm text-accent md:block">
              Tous les outils →
            </Link>
          </Reveal>
          <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outilsEnAvant.map((outil) => (
              <RevealItem key={outil.slug}>
                <ToolCard slug={outil.slug} />
              </RevealItem>
            ))}
          </RevealGroup>
          <Link href="/outils" className="mt-6 block text-sm text-accent md:hidden">
            Tous les outils →
          </Link>
        </section>

        <section className="border-b border-border py-16">
          <Reveal className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border shadow-sm lg:aspect-auto lg:h-full lg:min-h-[22rem]">
              <Image
                src="https://images.unsplash.com/photo-1554774853-b415df9eeb92?w=1000&q=80"
                alt="Deux collègues échangent autour d'un document, dans un bureau lumineux"
                fill
                sizes="(min-width: 1024px) 38vw, 90vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-accent">Conçu pour vos équipes</p>
              <h2 className="mt-2 font-display text-2xl font-bold">Un même outil, quatre métiers exigeants</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {secteurs.map((s) => (
                  <div key={s.nom}>
                    <h3 className="font-display text-sm font-bold">{s.nom}</h3>
                    <p className="mt-1 text-sm text-muted">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="border-b border-border py-16">
          <Reveal>
            <h2 className="font-display text-2xl font-bold">Trois piliers</h2>
          </Reveal>
          <RevealGroup className="mt-8 grid gap-5 md:grid-cols-3">
            {pillars.map((p) => (
              <RevealItem key={p.title}>
                <div className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
                  <p className="font-mono text-xs uppercase tracking-wider text-accent">{p.k}</p>
                  <h3 className="mt-2 font-display text-lg font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted">{p.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="py-16">
          <Reveal className="relative overflow-hidden rounded-2xl border border-border shadow-sm">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&q=80"
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(100deg,var(--bg)_28%,color-mix(in_srgb,var(--bg)_78%,transparent)_55%,color-mix(in_srgb,var(--bg)_35%,transparent)_100%)]" />
            </div>
            <div className="relative px-8 py-14 text-center sm:text-left">
              <h2 className="font-display text-2xl font-bold sm:max-w-md">
                Prêt à sécuriser vos échanges de documents ?
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted">
                Créez votre organisation en moins de deux minutes — le premier
                compte de votre domaine devient administrateur.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
                <Link
                  href="/inscription"
                  className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink shadow-sm shadow-accent/20"
                >
                  Créer une organisation
                </Link>
                <Link
                  href="/outils/fusionner"
                  className="rounded-lg border border-border bg-surface/80 px-5 py-3 text-sm font-medium text-ink backdrop-blur"
                >
                  Essayer sans compte
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
