"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { CheckCircle2 } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

type Position = "bas-centre" | "bas-droite" | "bas-gauche" | "haut-centre" | "haut-droite" | "haut-gauche";
type Format = "n" | "n-total" | "page-n" | "page-n-total";

const POSITIONS: { value: Position; label: string }[] = [
  { value: "bas-centre", label: "Bas, centré" },
  { value: "bas-droite", label: "Bas, à droite" },
  { value: "bas-gauche", label: "Bas, à gauche" },
  { value: "haut-centre", label: "Haut, centré" },
  { value: "haut-droite", label: "Haut, à droite" },
  { value: "haut-gauche", label: "Haut, à gauche" },
];

const FORMATS: { value: Format; label: string; exemple: string }[] = [
  { value: "n", label: "1, 2, 3…", exemple: "3" },
  { value: "n-total", label: "1 / N", exemple: "3 / 10" },
  { value: "page-n", label: "Page 1", exemple: "Page 3" },
  { value: "page-n-total", label: "Page 1 / N", exemple: "Page 3 / 10" },
];

function formaterNumero(format: Format, n: number, total: number): string {
  switch (format) {
    case "n":
      return `${n}`;
    case "n-total":
      return `${n} / ${total}`;
    case "page-n":
      return `Page ${n}`;
    case "page-n-total":
      return `Page ${n} / ${total}`;
  }
}

export function NumerosPageTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [position, setPosition] = useState<Position>("bas-centre");
  const [format, setFormat] = useState<Format>("n-total");
  const [depart, setDepart] = useState(1);
  const [taillePolice, setTaillePolice] = useState(10);
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
    if (!fichier || !pageCount) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const bytes = await fichier.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const police = await pdf.embedFont(StandardFonts.Helvetica);
      const marge = 28;

      pdf.getPages().forEach((page, i) => {
        const { width, height } = page.getSize();
        const texte = formaterNumero(format, depart + i, depart + pageCount - 1);
        const largeurTexte = police.widthOfTextAtSize(texte, taillePolice);

        let x = marge;
        if (position.endsWith("centre")) x = (width - largeurTexte) / 2;
        if (position.endsWith("droite")) x = width - marge - largeurTexte;

        const y = position.startsWith("bas") ? marge : height - marge - taillePolice;

        page.drawText(texte, { x, y, size: taillePolice, font: police, color: rgb(0.35, 0.4, 0.5) });
      });

      const octets = await pdf.save();
      setResultat({ octets });
    } catch {
      setErreur("L'ajout des numéros a échoué — vérifiez le fichier.");
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

      {fichier && pageCount && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Position</span>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as Position)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Format</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as Format)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label} — {f.exemple}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Commencer à</span>
              <input
                type="number"
                min={0}
                value={depart}
                onChange={(e) => setDepart(Number(e.target.value) || 1)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Taille du texte</span>
              <input
                type="number"
                min={6}
                max={24}
                value={taillePolice}
                onChange={(e) => setTaillePolice(Number(e.target.value) || 10)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>
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
            {traitement ? "Application…" : "Ajouter les numéros"}
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
                  "aegis-num-numerote.pdf",
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
