"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { CheckCircle2 } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

type Marges = { haut: number; bas: number; gauche: number; droite: number };
type Bord = keyof Marges;

const MAX_MARGE = 45;

export function RognerTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [marges, setMarges] = useState<Marges>({ haut: 5, bas: 5, gauche: 5, droite: 5 });
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ octets: Uint8Array } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);

  const { pages: apercu, chargement } = usePdfRender(fichier, { targetWidth: 420, pages: [0] });
  const pageApercu = apercu[0];

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setMarges({ haut: 5, bas: 5, gauche: 5, droite: 5 });
    setResultat(null);
    setErreur(null);
  };

  const majMarge = (bord: Bord, valeur: number) => {
    setMarges((prev) => ({ ...prev, [bord]: Math.min(MAX_MARGE, Math.max(0, valeur)) }));
    setResultat(null);
  };

  const commencerDrag = useCallback(
    (bord: Bord) => (e: React.PointerEvent) => {
      e.preventDefault();
      const conteneur = conteneurRef.current;
      if (!conteneur) return;
      const rect = conteneur.getBoundingClientRect();

      const onMove = (ev: PointerEvent) => {
        if (bord === "haut") {
          majMarge("haut", ((ev.clientY - rect.top) / rect.height) * 100);
        } else if (bord === "bas") {
          majMarge("bas", ((rect.bottom - ev.clientY) / rect.height) * 100);
        } else if (bord === "gauche") {
          majMarge("gauche", ((ev.clientX - rect.left) / rect.width) * 100);
        } else {
          majMarge("droite", ((rect.right - ev.clientX) / rect.width) * 100);
        }
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [],
  );

  const traiter = async () => {
    if (!fichier) return;
    if (marges.haut + marges.bas >= 100 || marges.gauche + marges.droite >= 100) {
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
        const x = (marges.gauche / 100) * width;
        const y = (marges.bas / 100) * height;
        const largeur = width * (1 - marges.gauche / 100 - marges.droite / 100);
        const hauteur = height * (1 - marges.haut / 100 - marges.bas / 100);
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
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_220px]">
          <div>
            <p className="mb-2 text-sm text-muted">
              Faites glisser les bords du cadre pour définir la zone conservée.
              {chargement && " Aperçu en cours de génération…"}
            </p>
            <div className="flex items-center justify-center rounded-lg border border-border bg-surface-2 p-6">
              {pageApercu ? (
                <div ref={conteneurRef} className="relative select-none" style={{ touchAction: "none" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- aperçu genere localement (canvas) */}
                  <img src={pageApercu.dataUrl} alt="Aperçu de la page" className="block max-w-full" draggable={false} />

                  {/* voile hors-cadre */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-black/40"
                    style={{
                      clipPath: `polygon(0% 0%, 0% 100%, ${marges.gauche}% 100%, ${marges.gauche}% ${marges.haut}%, ${100 - marges.droite}% ${marges.haut}%, ${100 - marges.droite}% ${100 - marges.bas}%, ${marges.gauche}% ${100 - marges.bas}%, ${marges.gauche}% 100%, 100% 100%, 100% 0%)`,
                    }}
                  />
                  {/* cadre */}
                  <div
                    className="pointer-events-none absolute border-2 border-accent"
                    style={{
                      top: `${marges.haut}%`,
                      bottom: `${marges.bas}%`,
                      left: `${marges.gauche}%`,
                      right: `${marges.droite}%`,
                    }}
                  />

                  {/* poignées de bord */}
                  <div
                    onPointerDown={commencerDrag("haut")}
                    className="absolute inset-x-0 h-2 cursor-ns-resize"
                    style={{ top: `calc(${marges.haut}% - 4px)` }}
                  />
                  <div
                    onPointerDown={commencerDrag("bas")}
                    className="absolute inset-x-0 h-2 cursor-ns-resize"
                    style={{ bottom: `calc(${marges.bas}% - 4px)` }}
                  />
                  <div
                    onPointerDown={commencerDrag("gauche")}
                    className="absolute inset-y-0 w-2 cursor-ew-resize"
                    style={{ left: `calc(${marges.gauche}% - 4px)` }}
                  />
                  <div
                    onPointerDown={commencerDrag("droite")}
                    className="absolute inset-y-0 w-2 cursor-ew-resize"
                    style={{ right: `calc(${marges.droite}% - 4px)` }}
                  />
                </div>
              ) : (
                <div className="flex h-64 w-full items-center justify-center">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium">Marges (%)</p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { bord: "haut" as const, label: "Haut" },
                  { bord: "bas" as const, label: "Bas" },
                  { bord: "gauche" as const, label: "Gauche" },
                  { bord: "droite" as const, label: "Droite" },
                ]
              ).map((champ) => (
                <label key={champ.bord} className="block text-sm">
                  <span className="mb-1.5 block text-xs text-muted">{champ.label}</span>
                  <input
                    type="number"
                    min={0}
                    max={MAX_MARGE}
                    value={Math.round(marges[champ.bord])}
                    onChange={(e) => majMarge(champ.bord, Number(e.target.value) || 0)}
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
              className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
            >
              {traitement ? "Application…" : "Rogner le PDF"}
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
