"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { FileText, X } from "lucide-react";
import { formatTaille } from "@/lib/pdf-page-ranges";

type Props = {
  accept: string;
  fichier: File | null;
  onCharge: (fichier: File) => void;
  onReinitialiser: () => void;
  texte?: string;
};

export function GenericFileDropzone({ accept, fichier, onCharge, onReinitialiser, texte }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const extensions = accept.split(",").map((e) => e.trim().toLowerCase());

  const choisir = (fileList: FileList | File[]) => {
    const candidat = Array.from(fileList)[0];
    if (!candidat) return;
    const nom = candidat.name.toLowerCase();
    if (!extensions.some((ext) => nom.endsWith(ext))) return;
    onCharge(candidat);
  };

  if (fichier) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <FileText size={18} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{fichier.name}</p>
          <p className="text-xs text-muted">{formatTaille(fichier.size)}</p>
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
    <motion.div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length) choisir(e.dataTransfer.files);
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
      <p className="font-medium">{texte ?? "Glissez un fichier ici, ou cliquez pour le choisir"}</p>
      <p className="mt-1 text-sm text-muted">Rien n&apos;est envoyé sans votre action — le fichier n&apos;est traité qu&apos;après confirmation.</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) choisir(e.target.files);
          e.target.value = "";
        }}
      />
    </motion.div>
  );
}
