"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ScanText } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { api, ApiError } from "@/lib/api";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

type Langue = "fra" | "eng" | "fra+eng";

const LANGUES: { valeur: Langue; label: string }[] = [
  { valeur: "fra+eng", label: "Français + Anglais" },
  { valeur: "fra", label: "Français" },
  { valeur: "eng", label: "Anglais" },
];

export function OcrTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [langue, setLangue] = useState<Langue>("fra+eng");
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ blob: Blob } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const { pages: apercu } = usePdfRender(fichier, { targetWidth: 320, pages: [0] });
  const pageApercu = apercu[0];

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
      const blob = await api.ocrPdf(fichier, langue);
      setResultat({ blob });
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "La reconnaissance de texte a échoué");
    } finally {
      setTraitement(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
        <ScanText size={16} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-muted">
          Une couche de texte invisible est superposée à chaque page scannée par un service
          dédié et éphémère — l&apos;apparence du document reste identique, mais son contenu
          devient sélectionnable, copiable et indexable par une recherche.
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
        <div className="mt-6 flex flex-col gap-6 sm:flex-row">
          {pageApercu && (
            <div className="mx-auto shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2 sm:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- aperçu généré localement (canvas) */}
              <img src={pageApercu.dataUrl} alt="Aperçu de la première page" className="block max-w-full" />
            </div>
          )}

          <div className="flex-1 space-y-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Langue du document</legend>
              <div className="flex flex-wrap gap-2">
                {LANGUES.map((l) => (
                  <button
                    key={l.valeur}
                    type="button"
                    onClick={() => {
                      setLangue(l.valeur);
                      setResultat(null);
                    }}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      langue === l.valeur
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border text-muted hover:text-ink"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {erreur && <p className="text-sm text-amber-700">{erreur}</p>}

            {!resultat && (
              <motion.button
                whileHover={{ scale: traitement ? 1 : 1.02 }}
                whileTap={{ scale: traitement ? 1 : 0.98 }}
                type="button"
                onClick={traiter}
                disabled={traitement}
                className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
              >
                {traitement ? "Reconnaissance en cours…" : "Lancer l'OCR"}
              </motion.button>
            )}
            {traitement && (
              <p className="text-xs text-muted">
                Peut prendre jusqu&apos;à quelques minutes selon le nombre de pages.
              </p>
            )}
          </div>
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
              onClick={() => telechargerBlob(resultat.blob, "aegis-num-ocr.pdf")}
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
