"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";

type PdfItem = {
  id: string;
  file: File;
  pageCount: number | null;
  error: string | null;
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function MergeTool() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [merging, setMerging] = useState(false);
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    setResult(null);
    const incoming = Array.from(fileList).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );

    const newItems: PdfItem[] = incoming.map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      file,
      pageCount: null,
      error: null,
    }));

    setItems((prev) => [...prev, ...newItems]);

    for (const item of newItems) {
      try {
        const bytes = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const count = pdf.getPageCount();
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, pageCount: count } : it))
        );
      } catch {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, error: "Fichier illisible — PDF corrompu ou protégé" }
              : it
          )
        );
      }
    }
  }, []);

  const move = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (id: string) => {
    setResult(null);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const merge = async () => {
    setMerging(true);
    setResult(null);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const item of items) {
        if (item.error) continue;
        const bytes = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResult({ url, size: blob.size });
    } finally {
      setMerging(false);
    }
  };

  const validCount = items.filter((it) => !it.error).length;

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
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
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
        <p className="font-medium">Glissez vos PDF ici, ou cliquez pour choisir des fichiers</p>
        <p className="mt-1 text-sm text-muted">
          Rien n&apos;est envoyé nulle part — tout reste dans cet onglet.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </motion.div>

      {items.length > 0 && (
        <ul className="mt-6 space-y-2">
          <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
              >
                <span className="font-mono text-xs text-muted">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <p className="text-xs text-muted">
                    {item.error ?? (
                      <>
                        {formatSize(item.file.size)}
                        {item.pageCount !== null && ` · ${item.pageCount} page${item.pageCount > 1 ? "s" : ""}`}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Monter"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded-md border border-border px-2 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Descendre"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    className="rounded-md border border-border px-2 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label="Retirer"
                    onClick={() => remove(item.id)}
                    className="rounded-md border border-border px-2 py-1 text-xs text-muted transition-colors hover:border-red-300 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <div className="mt-6 flex items-center gap-4">
        <motion.button
          whileHover={{ scale: validCount < 2 || merging ? 1 : 1.02 }}
          whileTap={{ scale: validCount < 2 || merging ? 1 : 0.98 }}
          type="button"
          onClick={merge}
          disabled={validCount < 2 || merging}
          className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
        >
          {merging ? "Fusion en cours…" : `Fusionner ${validCount || ""} PDF`}
        </motion.button>
        {validCount < 2 && items.length > 0 && (
          <p className="text-sm text-muted">Ajoutez au moins deux PDF valides.</p>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex items-start gap-3 rounded-lg border border-good/30 bg-good-soft px-4 py-3"
          >
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
              className="mt-0.5 text-good"
            >
              <CheckCircle2 size={18} />
            </motion.span>
            <div>
              <p className="text-sm font-medium text-good">
                Fusion réussie — {formatSize(result.size)}
              </p>
              <a
                href={result.url}
                download="aegis-num-fusion.pdf"
                className="mt-2 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
              >
                Télécharger le PDF fusionné
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
