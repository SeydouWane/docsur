"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Globe } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

export function HtmlVersPdfTool() {
  const [url, setUrl] = useState("");
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ blob: Blob } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const convertir = async (e: FormEvent) => {
    e.preventDefault();
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const blob = await api.htmlVersPdf(url.trim());
      setResultat({ blob });
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "La conversion a échoué");
    } finally {
      setTraitement(false);
    }
  };

  return (
    <div>
      <form onSubmit={convertir} className="flex gap-2">
        <div className="relative flex-1">
          <Globe size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemple.com/page"
            className="w-full rounded-lg border border-border bg-surface py-3 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
        <motion.button
          whileHover={{ scale: traitement ? 1 : 1.02 }}
          whileTap={{ scale: traitement ? 1 : 0.98 }}
          type="submit"
          disabled={traitement || !url.trim()}
          className="shrink-0 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
        >
          {traitement ? "Conversion…" : "Convertir"}
        </motion.button>
      </form>

      {erreur && <p className="mt-3 text-sm text-amber-700">{erreur}</p>}

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
              <p className="text-sm font-medium text-good">Terminé — {formatTaille(resultat.blob.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => telechargerBlob(resultat.blob, "aegis-num-page.pdf")}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
            >
              Télécharger le PDF
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
