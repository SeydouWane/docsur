import Link from "next/link";
import { UploadCloud, ShieldCheck, Share2 } from "lucide-react";
import { ToolCard } from "@/components/tool-card";
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
        <section className="grid gap-10 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
              SaaS documentaire B2B
            </p>
            <h1 className="text-balance font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              La simplicité d&apos;un outil PDF grand public, la maîtrise en plus.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Vos équipes RH, juridique et finance fusionnent, convertissent et
              signent des documents sensibles chaque semaine. DocSur leur donne
              les mêmes gestes simples, sans faire quitter le fichier du
              périmètre de l&apos;entreprise.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/outils/fusionner"
                className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink"
              >
                Essayer la fusion PDF
              </Link>
              <Link
                href="/outils"
                className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink"
              >
                Voir tous les outils
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <p className="mb-4 font-mono text-xs uppercase tracking-wider text-muted">
              Ce que ça change
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-good" />
                Le fichier ne quitte pas le poste pour fusionner, diviser ou pivoter.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-good" />
                Tout traitement serveur est chiffré, éphémère et purgé automatiquement.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-good" />
                Chaque action est journalisée — qui, quoi, quand.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-good" />
                Signature électronique sur chaîne open source, auto-hébergée.
              </li>
            </ul>
          </div>
        </section>
      </div>

      <section className="border-t border-border bg-surface-2/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-bold">Comment ça marche</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {etapes.map((e) => (
              <div key={e.n}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-accent">{e.n}</span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <e.icon size={18} strokeWidth={1.75} />
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold">{e.titre}</h3>
                <p className="mt-1.5 text-sm text-muted">{e.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <section className="border-t border-border py-16">
          <div className="flex items-end justify-between">
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
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outilsEnAvant.map((outil) => (
              <ToolCard key={outil.slug} outil={outil} />
            ))}
          </div>
          <Link href="/outils" className="mt-6 block text-sm text-accent md:hidden">
            Tous les outils →
          </Link>
        </section>

        <section className="border-t border-border py-16">
          <h2 className="font-display text-2xl font-bold">Trois piliers</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-border bg-surface p-6 shadow-sm"
              >
                <p className="font-mono text-xs uppercase tracking-wider text-accent">
                  {p.k}
                </p>
                <h3 className="mt-2 font-display text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border py-16">
          <div className="rounded-2xl border border-border bg-surface px-8 py-12 text-center shadow-sm">
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
          </div>
        </section>
      </div>
    </div>
  );
}
