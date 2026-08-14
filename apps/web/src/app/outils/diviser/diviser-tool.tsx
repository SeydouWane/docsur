"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { zipSync } from "fflate";
import { CheckCircle2, FileDown } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { parsePageRanges, telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

type Resultat = { nom: string; octets: Uint8Array };

export function DiviserTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [plages, setPlages] = useState("");
  const [traitement, setTraitement] = useState(false);
  const [resultats, setResultats] = useState<Resultat[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setPlages("");
    setResultats(null);
    setErreur(null);
  };

  const remplirChaquePage = () => {
    if (!pageCount) return;
    setPlages(Array.from({ length: pageCount }, (_, i) => i + 1).join("\n"));
  };

  const diviser = async () => {
    if (!fichier || !pageCount) return;
    const lignes = plages
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lignes.length === 0) {
      setErreur("Indiquez au moins une plage de pages (une par ligne).");
      return;
    }

    setTraitement(true);
    setErreur(null);
    setResultats(null);
    try {
      const bytes = await fichier.arrayBuffer();
      const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const sorties: Resultat[] = [];

      for (let i = 0; i < lignes.length; i++) {
        const indices = parsePageRanges(lignes[i], pageCount);
        if (indices.length === 0) continue;
        const nouveau = await PDFDocument.create();
        const pages = await nouveau.copyPages(source, indices);
        pages.forEach((p) => nouveau.addPage(p));
        const octets = await nouveau.save();
        sorties.push({ nom: `partie-${i + 1}.pdf`, octets });
      }

      if (sorties.length === 0) {
        setErreur("Aucune page valide dans les plages indiquées.");
        return;
      }
      setResultats(sorties);
    } catch {
      setErreur("La division a échoué — vérifiez le fichier et les plages indiquées.");
    } finally {
      setTraitement(false);
    }
  };

  const telechargerTout = () => {
    if (!resultats) return;
    const fichiers: Record<string, Uint8Array> = {};
    resultats.forEach((r) => (fichiers[r.nom] = r.octets));
    const zip = zipSync(fichiers);
    telechargerBlob(new Blob([new Uint8Array(zip)], { type: "application/zip" }), "aegis-num-division.zip");
  };

  return (
    <div>
      <SinglePdfDropzone
        fichier={fichier}
        pageCount={pageCount}
        onCharge={(f, p) => {
          setFichier(f);
          setPageCount(p);
          setResultats(null);
        }}
        onReinitialiser={reinitialiser}
      />

      {fichier && pageCount && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Une plage par ligne (ex. 1-3)</label>
            <button type="button" onClick={remplirChaquePage} className="text-sm text-accent">
              Une page par fichier
            </button>
          </div>
          <textarea
            value={plages}
            onChange={(e) => setPlages(e.target.value)}
            rows={5}
            placeholder={`1-3\n4-6\n7-${pageCount}`}
            className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <p className="mt-1 text-xs text-muted">Document de {pageCount} pages.</p>

          {erreur && <p className="mt-2 text-sm text-amber-700">{erreur}</p>}

          <motion.button
            whileHover={{ scale: traitement ? 1 : 1.02 }}
            whileTap={{ scale: traitement ? 1 : 0.98 }}
            type="button"
            onClick={diviser}
            disabled={traitement || !plages.trim()}
            className="mt-4 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
          >
            {traitement ? "Division en cours…" : "Diviser le PDF"}
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {resultats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-lg border border-good/30 bg-good-soft px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-good" />
              <p className="text-sm font-medium text-good">
                {resultats.length} fichier{resultats.length > 1 ? "s" : ""} généré
                {resultats.length > 1 ? "s" : ""}
              </p>
            </div>
            <ul className="mt-3 space-y-1.5">
              {resultats.map((r) => (
                <li key={r.nom} className="flex items-center justify-between text-sm">
                  <span>{r.nom}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{formatTaille(r.octets.byteLength)}</span>
                    <button
                      type="button"
                      onClick={() => telechargerBlob(new Blob([new Uint8Array(r.octets)], { type: "application/pdf" }), r.nom)}
                      className="text-accent"
                      aria-label={`Télécharger ${r.nom}`}
                    >
                      <FileDown size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {resultats.length > 1 && (
              <button
                type="button"
                onClick={telechargerTout}
                className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
              >
                Télécharger tout (.zip)
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
