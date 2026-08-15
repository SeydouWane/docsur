"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Building2, Users, FileText, ScrollText, ArrowRight, Merge, Gauge, PenLine } from "lucide-react";
import { api, type EntreeAudit, type Organisation, type Membre, type Workspace, type DocumentMeta } from "@/lib/api";
import { useDashboard } from "./dashboard-context";
import { StatCard, LigneAudit } from "./dashboard-ui";

const OUTILS_RAPIDES = [
  { href: "/outils/fusionner", label: "Fusionner", icon: Merge },
  { href: "/outils/compresser", label: "Compresser", icon: Gauge },
  { href: "/outils/signer", label: "Signer", icon: PenLine },
];

export default function VueEnsemblePage() {
  const { profil } = useDashboard();
  const [audit, setAudit] = useState<EntreeAudit[] | null>(null);
  const [organisations, setOrganisations] = useState<Organisation[] | null>(null);
  const [membres, setMembres] = useState<Membre[] | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [documents, setDocuments] = useState<DocumentMeta[] | null>(null);

  const estAdminEntreprise = profil.role === "ADMIN" && profil.organisation.type === "ENTREPRISE";

  useEffect(() => {
    api.audit({ limite: 6 }).then(setAudit).catch(() => setAudit([]));
    api.documents().then(setDocuments).catch(() => setDocuments([]));
    if (profil.estSuperAdmin) {
      api.organisations().then(setOrganisations).catch(() => setOrganisations([]));
    }
    if (estAdminEntreprise) {
      api.membres().then(setMembres).catch(() => setMembres([]));
      api.workspaces().then(setWorkspaces).catch(() => setWorkspaces([]));
    }
  }, [profil.estSuperAdmin, estAdminEntreprise]);

  const totalUtilisateursPlateforme = organisations?.reduce((s, o) => s + o._count.utilisateurs, 0) ?? null;
  const orgsActives = organisations?.filter((o) => o.statut === "ACTIVE").length ?? null;
  const membresActifs = membres?.filter((m) => m.statut === "ACTIF").length ?? null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
      <p className="font-mono text-xs uppercase tracking-wider text-accent">
        {profil.organisation.nom} · {profil.organisation.region === "SENEGAL_UEMOA" ? "Sénégal / UEMOA" : "Union européenne"}
        {profil.organisation.type === "INDIVIDUEL" && " · Compte particulier"}
      </p>
      <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight">Bonjour {profil.nom.split(" ")[0]}</h1>

      {!profil.mfaActif && (
        <div className="mt-4 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
          <span className="font-medium text-accent">MFA non activée. </span>
          <span className="text-muted">L&apos;authentification à deux facteurs sera obligatoire dès l&apos;enrôlement en V1.</span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {profil.estSuperAdmin && (
          <>
            <StatCard icon={Building2} label="Organisations" valeur={organisations?.length ?? "…"} detail={orgsActives !== null ? `${orgsActives} actives` : undefined} />
            <StatCard icon={Users} label="Comptes plateforme" valeur={totalUtilisateursPlateforme ?? "…"} />
          </>
        )}
        {estAdminEntreprise && (
          <>
            <StatCard icon={Users} label="Collaborateurs actifs" valeur={membresActifs ?? "…"} detail={membres ? `${membres.length} au total` : undefined} />
            <StatCard icon={Building2} label="Espaces de travail" valeur={workspaces?.length ?? "…"} />
          </>
        )}
        <StatCard icon={FileText} label={estAdminEntreprise || profil.estSuperAdmin ? "Documents" : "Mes documents"} valeur={documents?.length ?? "…"} />
        <StatCard icon={ScrollText} label="Actions récentes" valeur={audit?.length ?? "…"} detail="7 derniers jours" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">
              {profil.estSuperAdmin ? "Activité plateforme" : estAdminEntreprise ? "Activité de l'organisation" : "Mon activité récente"}
            </h2>
            <Link href="/tableau-de-bord/journal" className="flex items-center gap-1 text-sm text-accent">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>

          {audit === null ? (
            <div className="mt-4 h-32 animate-pulse rounded-lg bg-surface-2" />
          ) : audit.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              Aucune action enregistrée pour l&apos;instant — elle apparaîtra ici dès que vous utiliserez un outil.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {audit.map((entree) => (
                <LigneAudit key={entree.id} entree={entree} />
              ))}
            </ul>
          )}
        </div>

        <div className="lg:w-56">
          <h2 className="font-display text-lg font-bold">Outils rapides</h2>
          <div className="mt-4 space-y-2">
            {OUTILS_RAPIDES.map((outil) => (
              <Link
                key={outil.href}
                href={outil.href}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm hover:border-accent"
              >
                <outil.icon size={15} className="text-accent" />
                {outil.label}
              </Link>
            ))}
            <Link href="/outils" className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted hover:text-ink">
              Catalogue complet <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
