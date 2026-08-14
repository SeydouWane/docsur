"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { GenericFileDropzone } from "@/components/generic-file-dropzone";
import { api, ApiError } from "@/lib/api";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

// Volontairement GenericFileDropzone (pas SinglePdfDropzone) : ce dernier
// valide le fichier avec pdf-lib avant de l'accepter, ce qui échouerait
// précisément sur les PDF endommagés que cet outil est censé traiter.
export function ReparerTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ blob: Blob } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const reinitialiser = () => {
    setFichier(null);
    setResultat(null);
    setErreur(null);
  };

  const traiter = async () => {
    if (!fichier) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const blob = await api.reparerPdf(fichier);
      setResultat({ blob });
    } catch (err) {
      setErreur(
        err instanceof ApiError
          ? err.message
          : "La réparation a échoué — le fichier est peut-être trop endommagé",
      );
    } finally {
      setTraitement(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-muted">
          La réparation reconstruit la structure interne du PDF (table de références, en-têtes) —
          elle ne peut pas récupérer un contenu réellement perdu.
        </p>
      </div>

      <GenericFileDropzone
        accept=".pdf"
        fichier={fichier}
        onCharge={(f) => {
          setFichier(f);
          setResultat(null);
        }}
        onReinitialiser={reinitialiser}
        texte="Glissez le PDF endommagé ici, ou cliquez pour le choisir"
      />

      {erreur && <p className="mt-3 text-sm text-amber-700">{erreur}</p>}

      {fichier && !resultat && (
        <motion.button
          whileHover={{ scale: traitement ? 1 : 1.02 }}
          whileTap={{ scale: traitement ? 1 : 0.98 }}
          type="button"
          onClick={traiter}
          disabled={traitement}
          className="mt-4 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
        >
          {traitement ? "Réparation en cours…" : "Réparer le PDF"}
        </motion.button>
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
              onClick={() => telechargerBlob(resultat.blob, "aegis-num-repare.pdf")}
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
