"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { FileText, X } from "lucide-react";
import { formatTaille } from "@/lib/pdf-page-ranges";

type Props = {
  onCharge: (fichier: File, pageCount: number) => void;
  fichier: File | null;
  pageCount: number | null;
  onReinitialiser: () => void;
  texte?: string;
};

export function SinglePdfDropzone({ onCharge, fichier, pageCount, onReinitialiser, texte }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const charger = async (fileList: FileList | File[]) => {
    const fichier = Array.from(fileList).find(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    );
    if (!fichier) {
      setErreur("Merci de choisir un fichier PDF");
      return;
    }
    setErreur(null);
    setChargement(true);
    try {
      const bytes = await fichier.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      onCharge(fichier, pdf.getPageCount());
    } catch {
      setErreur("Fichier illisible — PDF corrompu ou protégé");
    } finally {
      setChargement(false);
    }
  };

  if (fichier && pageCount !== null) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <FileText size={18} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{fichier.name}</p>
          <p className="text-xs text-muted">
            {formatTaille(fichier.size)} · {pageCount} page{pageCount > 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          aria-label="Changer de fichier"
          onClick={onReinitialiser}
          className="rounded-md border border-border p-1.5 text-muted hover:text-ink"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

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
          if (e.dataTransfer.files.length) charger(e.dataTransfer.files);
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
        <p className="font-medium">{chargement ? "Lecture du fichier…" : (texte ?? "Glissez un PDF ici, ou cliquez pour le choisir")}</p>
        <p className="mt-1 text-sm text-muted">Rien n&apos;est envoyé nulle part — tout reste dans cet onglet.</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) charger(e.target.files);
            e.target.value = "";
          }}
        />
      </motion.div>
      {erreur && <p className="mt-2 text-sm text-amber-700">{erreur}</p>}
    </div>
  );
}
