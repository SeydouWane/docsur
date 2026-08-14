"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { api, ApiError } from "@/lib/api";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

type Props = {
  mode: "proteger" | "deverrouiller";
  nomTelecharge: string;
};

// api.protegerPdf / api.deverrouillerPdf sont résolus ici, côté client,
// plutôt que reçus en prop : une fonction n'est pas sérialisable à travers
// la frontière server/client (page.tsx est un composant serveur).
export function SecuritePdfPasswordTool({ mode, nomTelecharge }: Props) {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ blob: Blob } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setMotDePasse("");
    setConfirmation("");
    setResultat(null);
    setErreur(null);
  };

  const estProteger = mode === "proteger";
  const motDePasseValide = estProteger ? motDePasse.length >= 4 && motDePasse === confirmation : motDePasse.length > 0;

  const traiter = async () => {
    if (!fichier || !motDePasseValide) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const blob = await (estProteger ? api.protegerPdf : api.deverrouillerPdf)(fichier, motDePasse);
      setResultat({ blob });
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "L'opération a échoué");
    } finally {
      setTraitement(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-muted">
          {estProteger
            ? "Le chiffrement (AES-256) est effectué par un service dédié, chiffré et éphémère — votre mot de passe n'est jamais stocké."
            : "Le fichier est déchiffré par un service dédié, chiffré et éphémère — rien n'est conservé après la réponse."}
        </p>
      </div>

      <SinglePdfDropzone
        fichier={fichier}
        pageCount={pageCount}
        onCharge={(f, p) => {
          setFichier(f);
          setPageCount(p);
          setResultat(null);
        }}
        onReinitialiser={reinitialiser}
      />

      {fichier && (
        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">
              {estProteger ? "Nouveau mot de passe" : "Mot de passe du document"}
            </span>
            <div className="relative">
              <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete={estProteger ? "new-password" : "current-password"}
                className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            {estProteger && <span className="mt-1 block text-xs text-muted">4 caractères minimum</span>}
          </label>

          {estProteger && (
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Confirmer le mot de passe</span>
              <div className="relative">
                <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </div>
              {confirmation.length > 0 && confirmation !== motDePasse && (
                <span className="mt-1 block text-xs text-amber-700">Les mots de passe ne correspondent pas</span>
              )}
            </label>
          )}

          {erreur && <p className="text-sm text-amber-700">{erreur}</p>}

          <motion.button
            whileHover={{ scale: traitement ? 1 : 1.02 }}
            whileTap={{ scale: traitement ? 1 : 0.98 }}
            type="button"
            onClick={traiter}
            disabled={traitement || !motDePasseValide}
            className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
          >
            {traitement ? "Traitement en cours…" : estProteger ? "Protéger le PDF" : "Déverrouiller le PDF"}
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {resultat && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex items-center justify-between rounded-lg border border-good/30 bg-good-soft px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-good" />
              <p className="text-sm font-medium text-good">Terminé — {formatTaille(resultat.blob.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => telechargerBlob(resultat.blob, nomTelecharge)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
            >
              Télécharger
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
