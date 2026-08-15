"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, PenLine, ShieldCheck, Image as ImageIcon, LogIn } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { api, ApiError, type Profil } from "@/lib/api";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

type Zone = { xPct: number; yPct: number; largeurPct: number; hauteurPct: number };

const ZONE_PAR_DEFAUT: Zone = { xPct: 55, yPct: 78, largeurPct: 30, hauteurPct: 12 };
const RATIO_MIN_PCT = 4;

export function SignerTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageActuelle, setPageActuelle] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [zone, setZone] = useState<Zone>(ZONE_PAR_DEFAUT);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [profilCharge, setProfilCharge] = useState(false);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ blob: Blob } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { pages: apercu } = usePdfRender(fichier, { targetWidth: 560, pages: [pageActuelle] });
  const pageApercu = apercu[0];

  useEffect(() => {
    api
      .moi()
      .then(setProfil)
      .catch(() => setProfil(null))
      .finally(() => setProfilCharge(true));
  }, []);

  useEffect(() => {
    if (!image) {
      // L'image a disparu (réinitialisation) : l'URL objet précédente n'est
      // plus valide, pas une valeur dérivable au rendu.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setPageActuelle(0);
    setResultat(null);
    setErreur(null);
  };

  const choisirImage = (fileList: FileList | null) => {
    const f = fileList?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setImage(f);
    setZone(ZONE_PAR_DEFAUT);
    setResultat(null);
  };

  const pointVersPct = (clientX: number, clientY: number) => {
    const rect = conteneurRef.current!.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const commencerDeplacement = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const depart = pointVersPct(e.clientX, e.clientY);
    const zoneDepart = zone;
    setResultat(null);

    const onMove = (ev: PointerEvent) => {
      const point = pointVersPct(ev.clientX, ev.clientY);
      const dx = point.x - depart.x;
      const dy = point.y - depart.y;
      setZone((prev) => ({
        ...prev,
        xPct: Math.min(100 - zoneDepart.largeurPct, Math.max(0, zoneDepart.xPct + dx)),
        yPct: Math.min(100 - zoneDepart.hauteurPct, Math.max(0, zoneDepart.yPct + dy)),
      }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [zone]);

  const commencerRedimensionnement = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const depart = pointVersPct(e.clientX, e.clientY);
    const zoneDepart = zone;
    setResultat(null);

    const onMove = (ev: PointerEvent) => {
      const point = pointVersPct(ev.clientX, ev.clientY);
      const dx = point.x - depart.x;
      const dy = point.y - depart.y;
      setZone((prev) => ({
        ...prev,
        largeurPct: Math.min(100 - zoneDepart.xPct, Math.max(RATIO_MIN_PCT, zoneDepart.largeurPct + dx)),
        hauteurPct: Math.min(100 - zoneDepart.yPct, Math.max(RATIO_MIN_PCT, zoneDepart.hauteurPct + dy)),
      }));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [zone]);

  const traiter = async () => {
    if (!fichier || !image || !pageApercu) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const blob = await api.signerPdf(fichier, image, {
        page: pageActuelle + 1,
        x: (zone.xPct / 100) * pageApercu.pageWidthPt,
        y: (zone.yPct / 100) * pageApercu.pageHeightPt,
        largeur: (zone.largeurPct / 100) * pageApercu.pageWidthPt,
        hauteur: (zone.hauteurPct / 100) * pageApercu.pageHeightPt,
      });
      setResultat({ blob });
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "La signature a échoué");
    } finally {
      setTraitement(false);
    }
  };

  if (profilCharge && !profil) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface px-6 py-16 text-center">
        <ShieldCheck size={28} className="text-accent" />
        <div>
          <p className="font-medium">Connexion requise</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Signer un document grave votre nom dans un certificat cryptographique réel — nous devons donc
            savoir qui vous êtes.
          </p>
        </div>
        <Link
          href="/connexion"
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink"
        >
          <LogIn size={16} /> Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-muted">
          Signature électronique réelle (PAdES, horodatage RFC 3161 auto-hébergé) — chaque signature émet
          un certificat éphémère au nom de votre compte via l&apos;autorité de certification interne
          d&apos;Aegis-Num. {profil && (
            <>
              Vous signez en tant que <strong className="text-ink">{profil.nom}</strong>.
            </>
          )}
        </p>
      </div>

      <SinglePdfDropzone
        fichier={fichier}
        pageCount={pageCount}
        onCharge={(f, p) => {
          setFichier(f);
          setPageCount(p);
          setPageActuelle(0);
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
            {image && <p className="text-xs text-muted">Glissez pour déplacer, tirez le coin pour redimensionner</p>}
          </div>

          <div className="flex items-center justify-center overflow-auto rounded-lg border border-border bg-surface-2 p-4">
            {pageApercu ? (
              <div ref={conteneurRef} className="relative select-none" style={{ touchAction: "none" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- aperçu généré localement (canvas) */}
                <img src={pageApercu.dataUrl} alt={`Page ${pageActuelle + 1}`} className="block max-w-full" draggable={false} />

                {imageUrl && (
                  <div
                    onPointerDown={commencerDeplacement}
                    className="group absolute cursor-move border-2 border-accent bg-accent/5"
                    style={{
                      left: `${zone.xPct}%`,
                      top: `${zone.yPct}%`,
                      width: `${zone.largeurPct}%`,
                      height: `${zone.hauteurPct}%`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- image de signature fournie par l'utilisateur */}
                    <img src={imageUrl} alt="Signature" className="h-full w-full object-contain" draggable={false} />
                    <div
                      onPointerDown={commencerRedimensionnement}
                      className="absolute -right-1.5 -bottom-1.5 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-accent bg-surface"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-64 w-full items-center justify-center">
                <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  choisirImage(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink hover:border-accent"
              >
                {image ? <ImageIcon size={16} /> : <PenLine size={16} />}
                {image ? "Changer l'image de signature" : "Importer une image de signature"}
              </button>
              {image && <p className="mt-1 text-xs text-muted">{image.name}</p>}
            </div>

            {erreur && <p className="text-sm text-amber-700">{erreur}</p>}

            {image && !resultat && (
              <motion.button
                whileHover={{ scale: traitement ? 1 : 1.02 }}
                whileTap={{ scale: traitement ? 1 : 0.98 }}
                type="button"
                onClick={traiter}
                disabled={traitement}
                className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40 sm:ml-auto"
              >
                {traitement ? "Signature en cours…" : "Signer le document"}
              </motion.button>
            )}
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
              <p className="text-sm font-medium text-good">Document signé — {formatTaille(resultat.blob.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => telechargerBlob(resultat.blob, "aegis-num-signe.pdf")}
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
