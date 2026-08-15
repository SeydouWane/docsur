"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, api, type DocumentMeta } from "@/lib/api";
import { useDashboard } from "../dashboard-context";

function formatTaille(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function DocumentsPage() {
  const { profil } = useDashboard();
  const [documents, setDocuments] = useState<DocumentMeta[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    api
      .documents()
      .then(setDocuments)
      .catch((err) => setErreur(err instanceof ApiError ? err.message : "Chargement impossible"));
  }, []);

  const estCollectif = profil.estSuperAdmin || (profil.role === "ADMIN" && profil.organisation.type === "ENTREPRISE");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            {estCollectif ? "Documents" : "Mes documents"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {estCollectif
              ? `Les métadonnées des documents de ${profil.organisation.nom} — jamais leur contenu.`
              : "Les métadonnées de vos documents — jamais leur contenu."}
          </p>
        </div>
        <Link href="/outils/fusionner" className="hidden text-sm text-accent sm:block">
          Fusionner un PDF →
        </Link>
      </div>

      {erreur && (
        <p className="mt-4 rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
          {erreur}
        </p>
      )}

      {documents === null ? (
        <div className="mt-4 h-32 animate-pulse rounded-lg bg-surface-2" />
      ) : documents.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          Aucun document pour l&apos;instant. Les métadonnées apparaîtront ici une fois le dépôt de
          documents branché sur un espace de travail.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm"
            >
              <span className="font-medium">{doc.nom}</span>
              <span className="text-muted">
                {doc.workspace.nom} · {formatTaille(doc.tailleOctets)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
