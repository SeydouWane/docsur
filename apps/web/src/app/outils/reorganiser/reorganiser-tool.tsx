"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { CheckCircle2, Trash2 } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

export function ReorganiserTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [ordre, setOrdre] = useState<number[]>([]);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ octets: Uint8Array } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const { pages: vignettes, chargement, erreur: erreurRendu } = usePdfRender(fichier, { targetWidth: 220 });
  const vignetteParIndex = new Map(vignettes.map((v) => [v.index, v]));

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setOrdre([]);
    setResultat(null);
    setErreur(null);
  };

  const retirer = (pageIndex: number) => {
    setOrdre((prev) => prev.filter((i) => i !== pageIndex));
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
          <p className="mt-6 text-sm text-muted">
            Glissez les pages pour changer leur ordre.
            {chargement && " Aperçu en cours de génération…"}
          </p>
          {erreurRendu && <p className="mt-2 text-sm text-amber-700">{erreurRendu}</p>}

          <Reorder.Group
            axis="x"
            values={ordre}
            onReorder={setOrdre}
            className="mt-4 flex gap-3 overflow-x-auto pb-3"
          >
            {ordre.map((pageIndex, position) => {
              const vignette = vignetteParIndex.get(pageIndex);
              return (
                <Reorder.Item
                  key={pageIndex}
                  value={pageIndex}
                  className="relative shrink-0 cursor-grab select-none active:cursor-grabbing"
                  whileDrag={{ scale: 1.05, zIndex: 10, boxShadow: "0 8px 24px rgba(15,23,42,0.18)" }}
                >
                  <div className="w-[140px] overflow-hidden rounded-lg border border-border bg-surface">
                    <div className="flex h-[180px] items-center justify-center bg-surface-2">
                      {vignette ? (
                        // eslint-disable-next-line @next/next/no-img-element -- aperçu genere localement (canvas), pas une URL distante
                        <img src={vignette.dataUrl} alt={`Page ${pageIndex + 1}`} className="max-h-full max-w-full" draggable={false} />
                      ) : (
                        <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
                      )}
                    </div>
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="font-mono text-xs text-muted">
                        {position + 1} · p.{pageIndex + 1}
                      </span>
                      <button
                        type="button"
                        aria-label={`Retirer la page ${pageIndex + 1}`}
                        onClick={() => retirer(pageIndex)}
                        className="text-muted hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

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
