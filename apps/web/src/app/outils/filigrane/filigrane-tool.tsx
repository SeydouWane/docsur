"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { CheckCircle2 } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

export function FiligraneTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [texte, setTexte] = useState("CONFIDENTIEL");
  const [taille, setTaille] = useState(48);
  const [opacite, setOpacite] = useState(0.2);
  const [rotation, setRotation] = useState(-45);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ octets: Uint8Array } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const { pages: apercu, chargement } = usePdfRender(fichier, { targetWidth: 360, pages: [0] });
  const pageApercu = apercu[0];

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setResultat(null);
    setErreur(null);
  };

  const traiter = async () => {
    if (!fichier || !texte.trim()) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const bytes = await fichier.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const police = await pdf.embedFont(StandardFonts.HelveticaBold);
      const rad = (rotation * Math.PI) / 180;
      const largeur = police.widthOfTextAtSize(texte, taille);

      pdf.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const cx = width / 2;
        const cy = height / 2;
        const x = cx - (largeur / 2) * Math.cos(rad) + (taille * 0.35) * Math.sin(rad);
        const y = cy - (largeur / 2) * Math.sin(rad) - (taille * 0.35) * Math.cos(rad);

        page.drawText(texte, {
          x,
          y,
          size: taille,
          font: police,
          color: rgb(0.4, 0.45, 0.55),
          opacity: opacite,
          rotate: degrees(rotation),
        });
      });

      const octets = await pdf.save();
      setResultat({ octets });
    } catch {
      setErreur("L'ajout du filigrane a échoué — vérifiez le fichier.");
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
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_260px]">
          <div className="relative flex items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2">
            {pageApercu ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu genere localement (canvas) */}
                <img src={pageApercu.dataUrl} alt="Aperçu de la première page" className="block" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                  <span
                    className="whitespace-nowrap font-bold"
                    style={{
                      fontSize: taille * (pageApercu.width / 595),
                      opacity: opacite,
                      color: "rgb(102,115,140)",
                      transform: `rotate(${-rotation}deg)`,
                    }}
                  >
                    {texte || " "}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex h-64 w-full items-center justify-center">
                <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
              </div>
            )}
            {chargement && <p className="absolute bottom-2 left-2 text-xs text-muted">Aperçu…</p>}
          </div>

          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Texte</span>
              <input
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Taille</span>
              <input
                type="number"
                min={12}
                max={120}
                value={taille}
                onChange={(e) => setTaille(Number(e.target.value) || 48)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Opacité</span>
              <input
                type="number"
                min={0.05}
                max={1}
                step={0.05}
                value={opacite}
                onChange={(e) => setOpacite(Number(e.target.value) || 0.2)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Rotation (°)</span>
              <input
                type="number"
                min={-90}
                max={90}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>

            {erreur && <p className="text-sm text-amber-700">{erreur}</p>}

            <motion.button
              whileHover={{ scale: traitement ? 1 : 1.02 }}
              whileTap={{ scale: traitement ? 1 : 0.98 }}
              type="button"
              onClick={traiter}
              disabled={traitement || !texte.trim()}
              className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
            >
              {traitement ? "Application…" : "Ajouter le filigrane"}
            </motion.button>
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
              <p className="text-sm font-medium text-good">
                Terminé — {formatTaille(resultat.octets.byteLength)}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                telechargerBlob(
                  new Blob([new Uint8Array(resultat.octets)], { type: "application/pdf" }),
                  "aegis-num-filigrane.pdf",
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
