"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { GenericFileDropzone } from "@/components/generic-file-dropzone";
import { api, ApiError } from "@/lib/api";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

export function OfficeVersPdfTool({ accept, texte }: { accept: string; texte: string }) {
  const [fichier, setFichier] = useState<File | null>(null);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ blob: Blob } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const reinitialiser = () => {
    setFichier(null);
    setResultat(null);
    setErreur(null);
  };

  const convertir = async () => {
    if (!fichier) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const blob = await api.officeVersPdf(fichier);
      setResultat({ blob });
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "La conversion a échoué");
    } finally {
      setTraitement(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-muted">
          Ce fichier est envoyé à un moteur de conversion chiffré et éphémère — jamais stocké,
          supprimé aussitôt la conversion terminée.
        </p>
      </div>

      <GenericFileDropzone
        accept={accept}
        fichier={fichier}
        onCharge={(f) => {
          setFichier(f);
          setResultat(null);
        }}
        onReinitialiser={reinitialiser}
        texte={texte}
      />

      {erreur && <p className="mt-3 text-sm text-amber-700">{erreur}</p>}

      {fichier && !resultat && (
        <motion.button
          whileHover={{ scale: traitement ? 1 : 1.02 }}
          whileTap={{ scale: traitement ? 1 : 0.98 }}
          type="button"
          onClick={convertir}
          disabled={traitement}
          className="mt-4 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
        >
          {traitement ? "Conversion en cours…" : "Convertir en PDF"}
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
              onClick={() => telechargerBlob(resultat.blob, "aegis-num-converti.pdf")}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
            >
              Télécharger le PDF
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
