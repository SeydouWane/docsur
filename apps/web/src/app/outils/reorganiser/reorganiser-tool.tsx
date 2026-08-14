"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { CheckCircle2, Trash2 } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

export function ReorganiserTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [ordre, setOrdre] = useState<number[]>([]);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ octets: Uint8Array } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setOrdre([]);
    setResultat(null);
    setErreur(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    setOrdre((prev) => {
      const next = [...prev];
      const cible = index + direction;
      if (cible < 0 || cible >= next.length) return prev;
      [next[index], next[cible]] = [next[cible], next[index]];
      return next;
    });
  };

  const retirer = (index: number) => {
    setOrdre((prev) => prev.filter((_, i) => i !== index));
  };

  const traiter = async () => {
    if (!fichier || ordre.length === 0) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const bytes = await fichier.arrayBuffer();
      const source = await PDFDocument.load(bytes, { ignoreEncryption: true });

      const nouveau = await PDFDocument.create();
      const pages = await nouveau.copyPages(source, ordre);
      pages.forEach((p) => nouveau.addPage(p));
      const octets = await nouveau.save();
      setResultat({ octets });
    } catch {
      setErreur("Le réordonnancement a échoué — vérifiez le fichier.");
    } finally {
      setTraitement(false);
    }
  };

  return (
    <div>
      <SinglePdfDropzone
        fichier={fichier}
        pageCount={pageCount}
        onCharge={(f, p) => {
          setFichier(f);
          setPageCount(p);
          setOrdre(Array.from({ length: p }, (_, i) => i));
          setResultat(null);
        }}
        onReinitialiser={reinitialiser}
      />

      {fichier && pageCount && (
        <>
          <ul className="mt-6 space-y-2">
            <AnimatePresence initial={false}>
              {ordre.map((pageIndex, position) => (
                <motion.li
                  key={pageIndex}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <span className="font-mono text-xs text-muted">{position + 1}</span>
                  <span className="flex-1 text-sm font-medium">Page {pageIndex + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Monter"
                      onClick={() => move(position, -1)}
                      disabled={position === 0}
                      className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:text-ink disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Descendre"
                      onClick={() => move(position, 1)}
                      disabled={position === ordre.length - 1}
                      className="rounded-md border border-border px-2 py-1 text-xs text-muted hover:text-ink disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      aria-label="Retirer cette page"
                      onClick={() => retirer(position)}
                      className="rounded-md border border-border p-1.5 text-muted hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {erreur && <p className="mt-2 text-sm text-amber-700">{erreur}</p>}

          <motion.button
            whileHover={{ scale: traitement ? 1 : 1.02 }}
            whileTap={{ scale: traitement ? 1 : 0.98 }}
            type="button"
            onClick={traiter}
            disabled={traitement || ordre.length === 0}
            className="mt-4 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
          >
            {traitement ? "Application…" : "Appliquer le nouvel ordre"}
          </motion.button>
        </>
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
              <p className="text-sm font-medium text-good">
                Terminé — {formatTaille(resultat.octets.byteLength)}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                telechargerBlob(
                  new Blob([new Uint8Array(resultat.octets)], { type: "application/pdf" }),
                  "aegis-num-reorganise.pdf",
                )
              }
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
