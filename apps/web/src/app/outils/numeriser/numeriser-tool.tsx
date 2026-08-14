"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { CheckCircle2, Camera } from "lucide-react";
import { ameliorerImage, type ModeAmelioration } from "@/lib/pdf-scan";
import { formatTaille, telechargerBlob } from "@/lib/pdf-page-ranges";

type ImageItem = { id: string; file: File; apercu: string };

const MODES: { value: ModeAmelioration; label: string }[] = [
  { value: "ameliore", label: "Amélioré (contraste auto)" },
  { value: "noir-blanc", label: "Noir et blanc" },
  { value: "couleur", label: "Couleur d'origine" },
];

export function NumeriserTool() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [mode, setMode] = useState<ModeAmelioration>("ameliore");
  const [traitement, setTraitement] = useState(false);
  const [progression, setProgression] = useState<string | null>(null);
  const [resultat, setResultat] = useState<{ octets: Uint8Array } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ajouter = useCallback((fileList: FileList | File[]) => {
    setResultat(null);
    const images = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const nouveaux: ImageItem[] = images.map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      file,
      apercu: URL.createObjectURL(file),
    }));
    setItems((prev) => [...prev, ...nouveaux]);
  }, []);

  const retirer = (id: string) => {
    setResultat(null);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const move = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const cible = index + direction;
      if (cible < 0 || cible >= next.length) return prev;
      [next[index], next[cible]] = [next[cible], next[index]];
      return next;
    });
  };

  const creerPdf = async () => {
    if (items.length === 0) return;
    setTraitement(true);
    try {
      const pdf = await PDFDocument.create();
      for (let i = 0; i < items.length; i++) {
        setProgression(`Page ${i + 1} / ${items.length}`);
        const blob = await ameliorerImage(items[i].file, mode);
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const image = await pdf.embedJpg(bytes).catch(() => pdf.embedPng(bytes));
        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const octets = await pdf.save();
      setResultat({ octets });
    } finally {
      setTraitement(false);
      setProgression(null);
    }
  };

  return (
    <div>
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) ajouter(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        animate={{ scale: dragOver ? 1.015 : 1 }}
        transition={{ duration: 0.15 }}
        className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragOver ? "border-accent bg-accent-soft" : "border-border bg-surface"
        }`}
      >
        <Camera size={22} className="mx-auto mb-2 text-muted" />
        <p className="font-medium">Prenez une photo, ou glissez des images ici</p>
        <p className="mt-1 text-sm text-muted">Sur mobile, l&apos;appareil photo s&apos;ouvre directement.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) ajouter(e.target.files);
            e.target.value = "";
          }}
        />
      </motion.div>

      {items.length > 0 && (
        <>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="overflow-hidden rounded-lg border border-border bg-surface"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local d'un fichier choisi par l'utilisateur */}
                  <img src={item.apercu} alt="" className="h-28 w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 p-2">
                    <span className="font-mono text-xs text-muted">{index + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Déplacer avant"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className="rounded-md border border-border px-1.5 py-0.5 text-xs text-muted disabled:opacity-30"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        aria-label="Déplacer après"
                        onClick={() => move(index, 1)}
                        disabled={index === items.length - 1}
                        className="rounded-md border border-border px-1.5 py-0.5 text-xs text-muted disabled:opacity-30"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        aria-label="Retirer"
                        onClick={() => retirer(item.id)}
                        className="rounded-md border border-border px-1.5 py-0.5 text-xs text-muted hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="text-sm">
              <span className="mb-1.5 block font-medium">Rendu</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as ModeAmelioration)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <motion.button
            whileHover={{ scale: traitement ? 1 : 1.02 }}
            whileTap={{ scale: traitement ? 1 : 0.98 }}
            type="button"
            onClick={creerPdf}
            disabled={traitement}
            className="mt-4 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
          >
            {traitement ? progression ?? "Traitement…" : `Créer le PDF (${items.length} page${items.length > 1 ? "s" : ""})`}
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
                  "aegis-num-numerise.pdf",
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
