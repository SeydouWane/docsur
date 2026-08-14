import Link from "next/link";
import { UploadCloud, ShieldCheck, Share2 } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { Hero } from "@/components/hero";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { trouverOutil } from "@/lib/outils-catalogue";

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

const outilsEnAvant = ["fusionner", "compresser", "word-vers-pdf", "pdf-vers-word", "proteger", "signer"]
  .map(trouverOutil)
  .filter((o): o is NonNullable<typeof o> => Boolean(o));

export default function Home() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-6">
        <Hero />
      </div>

      <section className="border-t border-border bg-surface-2/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
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
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <section className="border-t border-border py-16">
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

        <section className="border-t border-border py-16">
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

        <section className="border-t border-border py-16">
          <Reveal className="rounded-2xl border border-border bg-surface px-8 py-12 text-center shadow-sm">
            <h2 className="font-display text-2xl font-bold">
              Prêt à sécuriser vos échanges de documents ?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              Créez votre organisation en moins de deux minutes — le premier
              compte de votre domaine devient administrateur.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/inscription"
                className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink"
              >
                Créer une organisation
              </Link>
              <Link
                href="/outils/fusionner"
                className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink"
              >
                Essayer sans compte
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
