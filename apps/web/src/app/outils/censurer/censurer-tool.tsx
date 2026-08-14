"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { ChevronLeft, ChevronRight, CheckCircle2, EyeOff, Trash2 } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { rasteriserPageAvecCensure } from "@/lib/pdf-export";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

type Zone = { id: string; page: number; xPct: number; yPct: number; largeurPct: number; hauteurPct: number };
type Rect = { x1: number; y1: number; x2: number; y2: number };

function normaliser(r: Rect) {
  return {
    xPct: Math.min(r.x1, r.x2),
    yPct: Math.min(r.y1, r.y2),
    largeurPct: Math.abs(r.x2 - r.x1),
    hauteurPct: Math.abs(r.y2 - r.y1),
  };
}

export function CensurerTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageActuelle, setPageActuelle] = useState(0);
  const [zones, setZones] = useState<Zone[]>([]);
  const [dessin, setDessin] = useState<Rect | null>(null);
  const [traitement, setTraitement] = useState(false);
  const [progression, setProgression] = useState<string | null>(null);
  const [resultat, setResultat] = useState<{ octets: Uint8Array } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);

  const { pages: apercu, chargement } = usePdfRender(fichier, { targetWidth: 520, pages: [pageActuelle] });
  const pageApercu = apercu[0];
  const zonesPage = zones.filter((z) => z.page === pageActuelle);

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setPageActuelle(0);
    setZones([]);
    setResultat(null);
    setErreur(null);
  };

  const pointVersPct = (clientX: number, clientY: number) => {
    const rect = conteneurRef.current!.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
    };
  };

  const commencerDessin = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-zone]")) return;
    const conteneur = conteneurRef.current;
    if (!conteneur) return;
    const depart = pointVersPct(e.clientX, e.clientY);
    setDessin({ x1: depart.x, y1: depart.y, x2: depart.x, y2: depart.y });
    setResultat(null);

    const onMove = (ev: PointerEvent) => {
      const point = pointVersPct(ev.clientX, ev.clientY);
      setDessin((prev) => (prev ? { ...prev, x2: point.x, y2: point.y } : null));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setDessin((actuel) => {
        if (actuel) {
          const n = normaliser(actuel);
          if (n.largeurPct > 1.5 && n.hauteurPct > 1.5) {
            setZones((prev) => [...prev, { id: crypto.randomUUID(), page: pageActuelle, ...n }]);
          }
        }
        return null;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [pageActuelle]);

  const retirerZone = (id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
    setResultat(null);
  };

  const traiter = async () => {
    if (!fichier || zones.length === 0 || !pageCount) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const bytes = await fichier.arrayBuffer();
      const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const sortie = await PDFDocument.create();

      for (let i = 0; i < pageCount; i++) {
        const zonesDeCettePage = zones.filter((z) => z.page === i);
        setProgression(`Page ${i + 1} / ${pageCount}`);

        if (zonesDeCettePage.length === 0) {
          const [page] = await sortie.copyPages(source, [i]);
          sortie.addPage(page);
          continue;
        }

        const pageSource = source.getPage(i);
        const { width, height } = pageSource.getSize();
        const png = await rasteriserPageAvecCensure(fichier, i, zonesDeCettePage);
        const image = await sortie.embedPng(png);
        const nouvellePage = sortie.addPage([width, height]);
        nouvellePage.drawImage(image, { x: 0, y: 0, width, height });
      }

      const octets = await sortie.save();
      setResultat({ octets });
    } catch {
      setErreur("La censure a échoué — vérifiez le fichier.");
    } finally {
      setTraitement(false);
      setProgression(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
        <EyeOff size={16} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-muted">
          Rédaction réelle : chaque page contenant une zone noircie est transformée en image avant
          d&apos;être réinsérée dans le document. Le texte et les images sous la zone sont
          définitivement supprimés, pas seulement recouverts.
        </p>
      </div>

      <SinglePdfDropzone
        fichier={fichier}
        pageCount={pageCount}
        onCharge={(f, p) => {
          setFichier(f);
          setPageCount(p);
          setPageActuelle(0);
          setZones([]);
          setResultat(null);
        }}
        onReinitialiser={reinitialiser}
      />

      {fichier && pageCount && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageActuelle((p) => Math.max(0, p - 1))}
                disabled={pageActuelle === 0}
                className="rounded-md border border-border p-1.5 text-muted hover:text-ink disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-mono text-xs text-muted">
                Page {pageActuelle + 1} / {pageCount}
                {zonesPage.length > 0 && ` · ${zonesPage.length} zone${zonesPage.length > 1 ? "s" : ""}`}
              </span>
              <button
                type="button"
                onClick={() => setPageActuelle((p) => Math.min(pageCount - 1, p + 1))}
                disabled={pageActuelle === pageCount - 1}
                className="rounded-md border border-border p-1.5 text-muted hover:text-ink disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <p className="text-xs text-muted">Glissez sur la page pour noircir une zone</p>
          </div>

          <div className="flex items-center justify-center overflow-auto rounded-lg border border-border bg-surface-2 p-4">
            {pageApercu ? (
              <div
                ref={conteneurRef}
                onPointerDown={commencerDessin}
                className="relative cursor-crosshair select-none"
                style={{ touchAction: "none" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu genere localement (canvas) */}
                <img src={pageApercu.dataUrl} alt={`Page ${pageActuelle + 1}`} className="block max-w-full" draggable={false} />

                {zonesPage.map((z) => (
                  <div
                    key={z.id}
                    data-zone
                    className="group absolute bg-black"
                    style={{ left: `${z.xPct}%`, top: `${z.yPct}%`, width: `${z.largeurPct}%`, height: `${z.hauteurPct}%` }}
                  >
                    <button
                      type="button"
                      onClick={() => retirerZone(z.id)}
                      aria-label="Retirer cette zone"
                      className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                ))}

                {dessin && (
                  <div
                    className="pointer-events-none absolute border-2 border-red-500 bg-black/60"
                    style={{
                      left: `${Math.min(dessin.x1, dessin.x2)}%`,
                      top: `${Math.min(dessin.y1, dessin.y2)}%`,
                      width: `${Math.abs(dessin.x2 - dessin.x1)}%`,
                      height: `${Math.abs(dessin.y2 - dessin.y1)}%`,
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="flex h-64 w-full items-center justify-center">
                <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
              </div>
            )}
            {chargement && <p className="text-xs text-muted">Aperçu…</p>}
          </div>

          {erreur && <p className="mt-3 text-sm text-amber-700">{erreur}</p>}

          <motion.button
            whileHover={{ scale: traitement ? 1 : 1.02 }}
            whileTap={{ scale: traitement ? 1 : 0.98 }}
            type="button"
            onClick={traiter}
            disabled={traitement || zones.length === 0}
            className="mt-4 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
          >
            {traitement ? progression ?? "Traitement…" : `Censurer ${zones.length || ""} zone${zones.length > 1 ? "s" : ""}`}
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
                  "aegis-num-censure.pdf",
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
