"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { zipSync } from "fflate";
import { CheckCircle2, FileDown, Plus } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

type Resultat = { nom: string; octets: Uint8Array };

export function DiviserTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  // affectation[i] = numero de groupe (0-based) de la page i.
  const [affectation, setAffectation] = useState<number[]>([]);
  const [groupeActif, setGroupeActif] = useState(0);
  const [traitement, setTraitement] = useState(false);
  const [resultats, setResultats] = useState<Resultat[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const { pages: vignettes, chargement, erreur: erreurRendu } = usePdfRender(fichier, { targetWidth: 200 });

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setAffectation([]);
    setGroupeActif(0);
    setResultats(null);
    setErreur(null);
  };

  const nbGroupes = affectation.length > 0 ? Math.max(...affectation) + 1 : 1;

  const assigner = (index: number) => {
    setAffectation((prev) => prev.map((g, i) => (i === index ? groupeActif : g)));
    setResultats(null);
  };

  const nouveauGroupe = () => {
    setGroupeActif(nbGroupes);
  };

  const diviser = async () => {
    if (!fichier || !pageCount) return;
    setTraitement(true);
    setErreur(null);
    setResultats(null);
    try {
      const bytes = await fichier.arrayBuffer();
      const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const sorties: Resultat[] = [];

      for (let g = 0; g < nbGroupes; g++) {
        const indices = affectation
          .map((groupe, index) => ({ groupe, index }))
          .filter((p) => p.groupe === g)
          .map((p) => p.index);
        if (indices.length === 0) continue;

        const nouveau = await PDFDocument.create();
        const pages = await nouveau.copyPages(source, indices);
        pages.forEach((p) => nouveau.addPage(p));
        const octets = await nouveau.save();
        sorties.push({ nom: `partie-${sorties.length + 1}.pdf`, octets });
      }

      if (sorties.length === 0) {
        setErreur("Aucune page assignée à un groupe.");
        return;
      }
      setResultats(sorties);
    } catch {
      setErreur("La division a échoué — vérifiez le fichier.");
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
          setAffectation(Array.from({ length: p }, () => 0));
          setGroupeActif(0);
          setResultats(null);
        }}
        onReinitialiser={reinitialiser}
      />

      {fichier && pageCount && (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Groupe actif :</span>
            {Array.from({ length: nbGroupes }, (_, g) => g).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroupeActif(g)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  groupeActif === g ? "bg-accent text-accent-ink" : "border border-border text-muted hover:text-ink"
                }`}
              >
                Fichier {g + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={nouveauGroupe}
              className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted hover:text-ink"
            >
              <Plus size={12} /> Nouveau fichier
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">
            Cliquez sur les pages pour les assigner au groupe actif.
            {chargement && " Aperçu en cours de génération…"}
          </p>
          {erreurRendu && <p className="mt-2 text-sm text-amber-700">{erreurRendu}</p>}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {affectation.map((groupe, index) => {
              const vignette = vignettes.find((v) => v.index === index);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => assigner(index)}
                  className="w-full overflow-hidden rounded-lg border border-border bg-surface text-left transition-colors hover:border-accent/40"
                >
                  <div className="flex h-[170px] items-center justify-center bg-surface-2">
                    {vignette ? (
                      // eslint-disable-next-line @next/next/no-img-element -- aperçu genere localement (canvas)
                      <img src={vignette.dataUrl} alt={`Page ${index + 1}`} className="max-h-full max-w-full" draggable={false} />
                    ) : (
                      <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
                    )}
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="font-mono text-xs text-muted">Page {index + 1}</span>
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[11px] text-accent">
                      Fichier {groupe + 1}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {erreur && <p className="mt-3 text-sm text-amber-700">{erreur}</p>}

          <motion.button
            whileHover={{ scale: traitement ? 1 : 1.02 }}
            whileTap={{ scale: traitement ? 1 : 0.98 }}
            type="button"
            onClick={diviser}
            disabled={traitement}
            className="mt-4 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
          >
            {traitement ? "Division en cours…" : "Diviser le PDF"}
          </motion.button>
        </>
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
