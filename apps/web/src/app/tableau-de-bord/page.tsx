"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { api, ApiError, clearToken, getToken, type DocumentMeta, type Profil } from "@/lib/api";
import { EquipeSection } from "./equipe-section";
import { PlateformeSection } from "./plateforme-section";

const ROLE_LABEL: Record<Profil["role"], string> = {
  ADMIN: "Administrateur",
  MANAGER: "Manager",
  COLLABORATEUR: "Collaborateur",
  INVITE_EXTERNE: "Invité externe",
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function TableauDeBordPage() {
  const router = useRouter();
  const [profil, setProfil] = useState<Profil | null>(null);
  const [documents, setDocuments] = useState<DocumentMeta[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/connexion");
      return;
    }
    Promise.all([api.moi(), api.documents()])
      .then(([p, docs]) => {
        setProfil(p);
        setDocuments(docs);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          router.replace("/connexion");
          return;
        }
        setErreur(err instanceof ApiError ? err.message : "Impossible de charger le tableau de bord");
      });
  }, [router]);

  const deconnecter = () => {
    clearToken();
    router.push("/connexion");
  };

  if (erreur) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <p className="rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
          {erreur}
        </p>
      </div>
    );
  }

  if (!profil || !documents) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-3 w-40 rounded bg-surface-2" />
          <div className="h-8 w-64 rounded bg-surface-2" />
          <div className="h-4 w-48 rounded bg-surface-2" />
          <div className="mt-6 h-20 rounded-lg bg-surface-2" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-2xl px-6 py-16"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-accent">
            {profil.organisation.nom} · {profil.organisation.region === "SENEGAL_UEMOA" ? "Sénégal / UEMOA" : "Union européenne"}
            {profil.organisation.type === "INDIVIDUEL" && " · Compte particulier"}
          </p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Bonjour {profil.nom.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {profil.email} · <span className="font-medium text-ink">{ROLE_LABEL[profil.role]}</span>
            {profil.estSuperAdmin && (
              <span className="ml-2 rounded-full bg-good-soft px-2 py-0.5 font-mono text-[11px] text-good">
                Superadmin Aegis-Num
              </span>
            )}
          </p>
        </div>
        <button
          onClick={deconnecter}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted"
        >
          Se déconnecter
        </button>
      </div>

      {!profil.mfaActif && (
        <div className="mt-6 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
          <span className="font-medium text-accent">MFA non activée. </span>
          <span className="text-muted">L&apos;authentification à deux facteurs sera obligatoire dès l&apos;enrôlement en V1.</span>
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Documents de l&apos;organisation</h2>
          <Link href="/outils/fusionner" className="text-sm text-accent">
            Fusionner un PDF →
          </Link>
        </div>

        {documents.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            Aucun document pour l&apos;instant. Les métadonnées apparaîtront ici une
            fois le dépôt de documents branché sur un espace de travail.
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
                  {doc.workspace.nom} · {formatSize(doc.tailleOctets)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {profil.role === "ADMIN" && profil.organisation.type === "ENTREPRISE" && (
        <EquipeSection monId={profil.id} />
      )}

      {profil.estSuperAdmin && <PlateformeSection />}
    </motion.div>
  );
}
