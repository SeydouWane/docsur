"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { CheckCircle2 } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

export function RognerTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [haut, setHaut] = useState(5);
  const [bas, setBas] = useState(5);
  const [gauche, setGauche] = useState(5);
  const [droite, setDroite] = useState(5);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ octets: Uint8Array } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setResultat(null);
    setErreur(null);
  };

  const traiter = async () => {
    if (!fichier) return;
    if (haut + bas >= 100 || gauche + droite >= 100) {
      setErreur("Les marges cumulées dépassent la taille de la page.");
      return;
    }
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const bytes = await fichier.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });

      pdf.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const x = (gauche / 100) * width;
        const y = (bas / 100) * height;
        const largeur = width * (1 - gauche / 100 - droite / 100);
        const hauteur = height * (1 - haut / 100 - bas / 100);
        page.setCropBox(x, y, largeur, hauteur);
      });

      const octets = await pdf.save();
      setResultat({ octets });
    } catch {
      setErreur("Le rognage a échoué — vérifiez le fichier.");
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
          setResultat(null);
        }}
        onReinitialiser={reinitialiser}
      />

      {fichier && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted">Marges à retirer, en % de la page.</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(
              [
                { label: "Haut", value: haut, set: setHaut },
                { label: "Bas", value: bas, set: setBas },
                { label: "Gauche", value: gauche, set: setGauche },
                { label: "Droite", value: droite, set: setDroite },
              ] as const
            ).map((champ) => (
              <label key={champ.label} className="block text-sm">
                <span className="mb-1.5 block font-medium">{champ.label}</span>
                <input
                  type="number"
                  min={0}
                  max={45}
                  value={champ.value}
                  onChange={(e) => champ.set(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
              </label>
            ))}
          </div>

          {erreur && <p className="text-sm text-amber-700">{erreur}</p>}

          <motion.button
            whileHover={{ scale: traitement ? 1 : 1.02 }}
            whileTap={{ scale: traitement ? 1 : 0.98 }}
            type="button"
            onClick={traiter}
            disabled={traitement}
            className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
          >
            {traitement ? "Application…" : "Rogner le PDF"}
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
              <p className="text-sm font-medium text-good">
                Terminé — {formatTaille(resultat.octets.byteLength)}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                telechargerBlob(
                  new Blob([new Uint8Array(resultat.octets)], { type: "application/pdf" }),
                  "aegis-num-rogne.pdf",
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
