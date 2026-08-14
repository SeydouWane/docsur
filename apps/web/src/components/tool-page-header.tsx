import Link from "next/link";

export function ToolPageHeader({
  categorie,
  titre,
  description,
}: {
  categorie: string;
  titre: string;
  description: string;
}) {
  return (
    <>
      <Link href="/outils" className="text-sm text-muted hover:text-ink">
        ← Tous les outils
      </Link>
      <p className="mb-3 mt-4 font-mono text-xs uppercase tracking-wider text-accent">{categorie}</p>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">{titre}</h1>
      <p className="mt-3 max-w-xl text-muted">{description}</p>
    </>
  );
}
