"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, FileWarning } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { api, ApiError } from "@/lib/api";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

type Props = {
  mode: "word" | "powerpoint";
  nomTelecharge: string;
};

// api.pdfVersWord / api.pdfVersPowerpoint sont résolus ici, côté client,
// plutôt que reçus en prop : une fonction n'est pas sérialisable à travers
// la frontière server/client (page.tsx est un composant serveur).
export function PdfVersOfficeTool({ mode, nomTelecharge }: Props) {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ blob: Blob } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setResultat(null);
    setErreur(null);
  };

  const traiter = async () => {
    if (!fichier) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const blob = await (mode === "word" ? api.pdfVersWord : api.pdfVersPowerpoint)(fichier);
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
        <FileWarning size={16} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-muted">
          Reconstruction par un service dédié et éphémère (LibreOffice) — le résultat reste
          {mode === "word" ? " fidèle sur du texte structuré, mais " : " "}
          une mise en page complexe (colonnes, tableaux imbriqués{mode === "powerpoint" ? ", animations" : ""}) peut
          nécessiter des retouches après import.
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
          {traitement ? "Conversion en cours…" : `Convertir en ${mode === "word" ? "Word" : "PowerPoint"}`}
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
