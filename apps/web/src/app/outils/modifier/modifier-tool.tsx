"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ChevronLeft, ChevronRight, CheckCircle2, ImagePlus, Trash2, Type } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

type AnnotationTexte = {
  id: string;
  type: "texte";
  page: number;
  xPct: number;
  yPct: number;
  texte: string;
  taille: number;
  couleur: string;
};

type AnnotationImage = {
  id: string;
  type: "image";
  page: number;
  xPct: number;
  yPct: number;
  largeurPct: number;
  hauteurPct: number;
  dataUrl: string;
};

type Annotation = AnnotationTexte | AnnotationImage;

const COULEURS = ["#0F172A", "#DC2626", "#0284C7", "#16A34A"];

function hexVersRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export function ModifierTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageActuelle, setPageActuelle] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [edition, setEdition] = useState<string | null>(null);
  const [couleurActive, setCouleurActive] = useState(COULEURS[0]);
  const [tailleActive, setTailleActive] = useState(16);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ octets: Uint8Array } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { pages: apercu, chargement } = usePdfRender(fichier, { targetWidth: 520, pages: [pageActuelle] });
  const pageApercu = apercu[0];
  const annotationsPage = annotations.filter((a) => a.page === pageActuelle);

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setPageActuelle(0);
    setAnnotations([]);
    setResultat(null);
    setErreur(null);
  };

  const cliquerPage = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-annotation]")) return;
    const rect = conteneurRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const id = crypto.randomUUID();
    setAnnotations((prev) => [
      ...prev,
      { id, type: "texte", page: pageActuelle, xPct, yPct, texte: "", taille: tailleActive, couleur: couleurActive },
    ]);
    setEdition(id);
    setResultat(null);
  };

  const ajouterImage = (fileList: FileList | null) => {
    const image = fileList?.[0];
    if (!image) return;
    const lecteur = new FileReader();
    lecteur.onload = () => {
      setAnnotations((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "image",
          page: pageActuelle,
          xPct: 35,
          yPct: 40,
          largeurPct: 30,
          hauteurPct: 20,
          dataUrl: lecteur.result as string,
        },
      ]);
    };
    lecteur.readAsDataURL(image);
    setResultat(null);
  };

  const retirer = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setResultat(null);
  };

  const majTexte = (id: string, texte: string) => {
    setAnnotations((prev) => prev.map((a) => (a.id === id && a.type === "texte" ? { ...a, texte } : a)));
  };

  const commencerDrag = useCallback(
    (id: string) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = conteneurRef.current?.getBoundingClientRect();
      if (!rect) return;

      const onMove = (ev: PointerEvent) => {
        const xPct = Math.min(96, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100));
        const yPct = Math.min(96, Math.max(0, ((ev.clientY - rect.top) / rect.height) * 100));
        setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, xPct, yPct } : a)));
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
    if (!fichier || annotations.length === 0) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const bytes = await fichier.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const police = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();

      for (const annotation of annotations) {
        const page = pages[annotation.page];
        if (!page) continue;
        const { width, height } = page.getSize();

        if (annotation.type === "texte") {
          if (!annotation.texte.trim()) continue;
          page.drawText(annotation.texte, {
            x: (annotation.xPct / 100) * width,
            y: height - (annotation.yPct / 100) * height - annotation.taille,
            size: annotation.taille,
            font: police,
            color: hexVersRgb(annotation.couleur),
          });
        } else {
          const reponse = await fetch(annotation.dataUrl);
          const tampon = await reponse.arrayBuffer();
          const estPng = annotation.dataUrl.startsWith("data:image/png");
          const image = estPng ? await pdf.embedPng(tampon) : await pdf.embedJpg(tampon);
          const largeur = (annotation.largeurPct / 100) * width;
          const hauteur = (annotation.hauteurPct / 100) * height;
          page.drawImage(image, {
            x: (annotation.xPct / 100) * width,
            y: height - (annotation.yPct / 100) * height - hauteur,
            width: largeur,
            height: hauteur,
          });
        }
      }

      const octets = await pdf.save();
      setResultat({ octets });
    } catch {
      setErreur("La modification a échoué — vérifiez le fichier.");
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
          setPageActuelle(0);
          setAnnotations([]);
          setResultat(null);
        }}
        onReinitialiser={reinitialiser}
      />

      {fichier && pageCount && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_220px]">
          <div>
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
              <p className="text-xs text-muted">Cliquez sur la page pour ajouter du texte</p>
            </div>

            <div className="flex items-center justify-center overflow-auto rounded-lg border border-border bg-surface-2 p-4">
              {pageApercu ? (
                <div
                  ref={conteneurRef}
                  onClick={cliquerPage}
                  className="relative cursor-text select-none"
                  style={{ touchAction: "none" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- aperçu genere localement (canvas) */}
                  <img src={pageApercu.dataUrl} alt={`Page ${pageActuelle + 1}`} className="block max-w-full" draggable={false} />

                  {annotationsPage.map((a) =>
                    a.type === "texte" ? (
                      <div
                        key={a.id}
                        data-annotation
                        onPointerDown={commencerDrag(a.id)}
                        className="group absolute cursor-grab active:cursor-grabbing"
                        style={{ left: `${a.xPct}%`, top: `${a.yPct}%` }}
                      >
                        {edition === a.id ? (
                          <input
                            autoFocus
                            value={a.texte}
                            onChange={(e) => majTexte(a.id, e.target.value)}
                            onBlur={() => setEdition(null)}
                            onKeyDown={(e) => e.key === "Enter" && setEdition(null)}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="rounded border border-accent bg-white px-1 py-0.5 outline-none"
                            style={{ fontSize: a.taille * 0.9, color: a.couleur, minWidth: 80 }}
                          />
                        ) : (
                          <span
                            onDoubleClick={() => setEdition(a.id)}
                            className="whitespace-nowrap rounded px-1 py-0.5 outline-dashed outline-1 outline-transparent group-hover:outline-accent/50"
                            style={{ fontSize: a.taille * 0.9, color: a.couleur }}
                          >
                            {a.texte || "…"}
                          </span>
                        )}
                        <button
                          type="button"
                          data-annotation
                          onClick={() => retirer(a.id)}
                          className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                        >
                          <Trash2 size={9} />
                        </button>
                      </div>
                    ) : (
                      <div
                        key={a.id}
                        data-annotation
                        onPointerDown={commencerDrag(a.id)}
                        className="group absolute cursor-grab active:cursor-grabbing"
                        style={{ left: `${a.xPct}%`, top: `${a.yPct}%`, width: `${a.largeurPct}%` }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- image importée localement par l'utilisateur */}
                        <img src={a.dataUrl} alt="" className="w-full rounded outline-dashed outline-1 outline-transparent group-hover:outline-accent/50" draggable={false} />
                        <button
                          type="button"
                          data-annotation
                          onClick={() => retirer(a.id)}
                          className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                        >
                          <Trash2 size={9} />
                        </button>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="flex h-64 w-full items-center justify-center">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
                </div>
              )}
              {chargement && <p className="text-xs text-muted">Aperçu…</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-sm font-medium">Texte</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={8}
                  max={64}
                  value={tailleActive}
                  onChange={(e) => setTailleActive(Number(e.target.value) || 16)}
                  className="w-16 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <div className="flex gap-1">
                  {COULEURS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Couleur ${c}`}
                      onClick={() => setCouleurActive(c)}
                      className={`h-6 w-6 rounded-full border-2 ${couleurActive === c ? "border-accent" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
                <Type size={12} /> Cliquez sur la page
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted hover:text-ink"
              >
                <ImagePlus size={14} /> Ajouter une image
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  ajouterImage(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {annotations.length > 0 && (
              <p className="text-xs text-muted">
                {annotations.length} élément{annotations.length > 1 ? "s" : ""} au total
              </p>
            )}

            {erreur && <p className="text-sm text-amber-700">{erreur}</p>}

            <motion.button
              whileHover={{ scale: traitement ? 1 : 1.02 }}
              whileTap={{ scale: traitement ? 1 : 0.98 }}
              type="button"
              onClick={traiter}
              disabled={traitement || annotations.length === 0}
              className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
            >
              {traitement ? "Application…" : "Appliquer les modifications"}
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
                  "aegis-num-modifie.pdf",
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
