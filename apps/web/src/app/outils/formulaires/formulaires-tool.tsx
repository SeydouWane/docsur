"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { ChevronLeft, ChevronRight, CheckCircle2, CheckSquare, Trash2, TextCursorInput } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

type Champ = {
  id: string;
  type: "texte" | "case";
  page: number;
  xPct: number;
  yPct: number;
  largeurPct: number;
  hauteurPct: number;
  nom: string;
};

let compteurTexte = 0;
let compteurCase = 0;

export function FormulairesTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageActuelle, setPageActuelle] = useState(0);
  const [champs, setChamps] = useState<Champ[]>([]);
  const [edition, setEdition] = useState<string | null>(null);
  const [modePlacement, setModePlacement] = useState<"texte" | "case" | null>(null);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ octets: Uint8Array } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);

  const { pages: apercu, chargement } = usePdfRender(fichier, { targetWidth: 520, pages: [pageActuelle] });
  const pageApercu = apercu[0];
  const champsPage = champs.filter((c) => c.page === pageActuelle);

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setPageActuelle(0);
    setChamps([]);
    setResultat(null);
    setErreur(null);
  };

  const cliquerPage = (e: React.MouseEvent) => {
    if (!modePlacement) return;
    if ((e.target as HTMLElement).closest("[data-champ]")) return;
    const rect = conteneurRef.current?.getBoundingClientRect();
    if (!rect) return;
    const type = modePlacement;
    const xPct = Math.min(80, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(90, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    const id = crypto.randomUUID();
    const nom = type === "texte" ? `champ_${++compteurTexte}` : `case_${++compteurCase}`;
    setChamps((prev) => [
      ...prev,
      {
        id,
        type,
        page: pageActuelle,
        xPct,
        yPct,
        largeurPct: type === "texte" ? 24 : 4,
        hauteurPct: type === "texte" ? 4.5 : 3,
        nom,
      },
    ]);
    setEdition(id);
    setModePlacement(null);
    setResultat(null);
  };

  const retirer = (id: string) => {
    setChamps((prev) => prev.filter((c) => c.id !== id));
    setResultat(null);
  };

  const renommer = (id: string, nom: string) => {
    setChamps((prev) => prev.map((c) => (c.id === id ? { ...c, nom } : c)));
  };

  const commencerDrag = useCallback(
    (id: string) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = conteneurRef.current?.getBoundingClientRect();
      if (!rect) return;
      const onMove = (ev: PointerEvent) => {
        const xPct = Math.min(95, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100));
        const yPct = Math.min(95, Math.max(0, ((ev.clientY - rect.top) / rect.height) * 100));
        setChamps((prev) => prev.map((c) => (c.id === id ? { ...c, xPct, yPct } : c)));
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
    if (!fichier || champs.length === 0) return;
    const noms = champs.map((c) => c.nom);
    if (new Set(noms).size !== noms.length) {
      setErreur("Deux champs ne peuvent pas avoir le même nom.");
      return;
    }

    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const bytes = await fichier.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const form = pdf.getForm();
      const pages = pdf.getPages();

      for (const champ of champs) {
        const page = pages[champ.page];
        if (!page || !champ.nom.trim()) continue;
        const { width, height } = page.getSize();
        const x = (champ.xPct / 100) * width;
        const largeur = (champ.largeurPct / 100) * width;
        const hauteur = (champ.hauteurPct / 100) * height;
        const y = height - (champ.yPct / 100) * height - hauteur;

        if (champ.type === "texte") {
          const champTexte = form.createTextField(champ.nom);
          champTexte.addToPage(page, { x, y, width: largeur, height: hauteur });
        } else {
          const caseACocher = form.createCheckBox(champ.nom);
          caseACocher.addToPage(page, { x, y, width: largeur, height: hauteur });
        }
      }

      const octets = await pdf.save();
      setResultat({ octets });
    } catch {
      setErreur("La création du formulaire a échoué — vérifiez le fichier et les noms de champs.");
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
          setChamps([]);
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
            </div>

            <div className="flex items-center justify-center overflow-auto rounded-lg border border-border bg-surface-2 p-4">
              {pageApercu ? (
                <div
                  ref={conteneurRef}
                  onClick={cliquerPage}
                  className={`relative select-none ${modePlacement ? "cursor-crosshair" : ""}`}
                  style={{ touchAction: "none" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- aperçu genere localement (canvas) */}
                  <img src={pageApercu.dataUrl} alt={`Page ${pageActuelle + 1}`} className="block max-w-full" draggable={false} />

                  {champsPage.map((c) => (
                    <div
                      key={c.id}
                      data-champ
                      onPointerDown={commencerDrag(c.id)}
                      className="group absolute cursor-grab border-2 border-dashed border-accent bg-accent-soft/60 active:cursor-grabbing"
                      style={{ left: `${c.xPct}%`, top: `${c.yPct}%`, width: `${c.largeurPct}%`, height: `${c.hauteurPct}%` }}
                    >
                      {edition === c.id ? (
                        <input
                          autoFocus
                          value={c.nom}
                          onChange={(e) => renommer(c.id, e.target.value)}
                          onBlur={() => setEdition(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEdition(null)}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="h-full w-full bg-white px-1 text-[11px] outline-none"
                        />
                      ) : (
                        <button
                          type="button"
                          onDoubleClick={() => setEdition(c.id)}
                          className="h-full w-full truncate px-1 text-left font-mono text-[10px] text-accent"
                        >
                          {c.nom}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => retirer(c.id)}
                        className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
                      >
                        <Trash2 size={9} />
                      </button>
                    </div>
                  ))}
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
            <p className="text-sm font-medium">Ajouter un champ</p>
            <p className="text-xs text-muted">
              {modePlacement
                ? "Cliquez sur la page pour placer le champ."
                : "Choisissez un type de champ, puis cliquez sur la page."}
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setModePlacement("texte")}
                className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${
                  modePlacement === "texte"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-dashed border-border text-muted hover:text-ink"
                }`}
              >
                <TextCursorInput size={14} /> Champ texte
              </button>
              <button
                type="button"
                onClick={() => setModePlacement("case")}
                className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${
                  modePlacement === "case"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-dashed border-border text-muted hover:text-ink"
                }`}
              >
                <CheckSquare size={14} /> Case à cocher
              </button>
            </div>

            {champs.length > 0 && (
              <p className="text-xs text-muted">
                {champs.length} champ{champs.length > 1 ? "s" : ""} au total — double-cliquez un champ pour le renommer
              </p>
            )}

            {erreur && <p className="text-sm text-amber-700">{erreur}</p>}

            <motion.button
              whileHover={{ scale: traitement ? 1 : 1.02 }}
              whileTap={{ scale: traitement ? 1 : 0.98 }}
              type="button"
              onClick={traiter}
              disabled={traitement || champs.length === 0}
              className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
            >
              {traitement ? "Création…" : "Créer le formulaire"}
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
                  "aegis-num-formulaire.pdf",
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
