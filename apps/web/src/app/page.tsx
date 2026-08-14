import Link from "next/link";

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

export default function Home() {
  return (
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
            <a
              href="/docs/specifications.html"
              className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink"
            >
              Lire les spécifications
            </a>
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
    </div>
  );
}
