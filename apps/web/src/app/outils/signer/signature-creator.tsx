"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Caveat, Dancing_Script, Great_Vibes } from "next/font/google";
import { X, Eraser, Type, PenTool, Upload } from "lucide-react";

const caveat = Caveat({ subsets: ["latin"], weight: ["600"] });
const dancingScript = Dancing_Script({ subsets: ["latin"], weight: ["600"] });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: ["400"] });

const STYLES_ECRITURE = [
  { id: "caveat", label: "Naturelle", font: caveat },
  { id: "dancing", label: "Élégante", font: dancingScript },
  { id: "vibes", label: "Manuscrite", font: greatVibes },
] as const;

type Mode = "dessiner" | "taper" | "importer";

const ENCRE = "#111827";

export function SignatureCreator({
  ouvert,
  nomParDefaut,
  onFermer,
  onCree,
}: {
  ouvert: boolean;
  nomParDefaut: string;
  onFermer: () => void;
  onCree: (fichier: File) => void;
}) {
  const [mode, setMode] = useState<Mode>("dessiner");

  return (
    <AnimatePresence>
      {ouvert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={onFermer}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold">Créer votre signature</h2>
              <button
                type="button"
                onClick={onFermer}
                aria-label="Fermer"
                className="rounded-md p-1.5 text-muted hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-1 rounded-lg border border-border bg-surface-2 p-1">
              {(
                [
                  { id: "dessiner", label: "Dessiner", icon: PenTool },
                  { id: "taper", label: "Taper", icon: Type },
                  { id: "importer", label: "Importer", icon: Upload },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={`relative flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    mode === id ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {mode === id && (
                    <motion.span
                      layoutId="mode-signature-actif"
                      className="absolute inset-0 rounded-md bg-surface shadow-sm"
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <Icon size={14} className="relative" strokeWidth={1.75} />
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>

            <div className="mt-5">
              {mode === "dessiner" && <PanneauDessin onCree={onCree} />}
              {mode === "taper" && <PanneauTexte nomParDefaut={nomParDefaut} onCree={onCree} />}
              {mode === "importer" && <PanneauImport onCree={onCree} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

async function canvasVersFichier(canvas: HTMLCanvasElement): Promise<File> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Génération de la signature impossible");
  return new File([blob], "signature.png", { type: "image/png" });
}

function PanneauDessin({ onCree }: { onCree: (fichier: File) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dessineRef = useRef(false);
  const [aDessine, setADessine] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext("2d");
    ctx?.scale(ratio, ratio);
  }, []);

  const position = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const demarrer = (e: React.PointerEvent) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    dessineRef.current = true;
    const { x, y } = position(e);
    ctx.strokeStyle = ENCRE;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const dessiner = (e: React.PointerEvent) => {
    if (!dessineRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = position(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!aDessine) setADessine(true);
  };

  const arreter = () => {
    dessineRef.current = false;
  };

  const effacer = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setADessine(false);
  };

  const valider = async () => {
    if (!canvasRef.current || !aDessine) return;
    onCree(await canvasVersFichier(canvasRef.current));
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg border border-border bg-surface-2">
        <canvas
          ref={canvasRef}
          onPointerDown={demarrer}
          onPointerMove={dessiner}
          onPointerUp={arreter}
          onPointerLeave={arreter}
          className="h-48 w-full cursor-crosshair touch-none"
        />
        {!aDessine && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted">
            Signez ici avec la souris, le doigt ou un stylet
          </p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={effacer}
          disabled={!aDessine}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-ink disabled:opacity-40"
        >
          <Eraser size={14} /> Effacer
        </button>
        <button
          type="button"
          onClick={valider}
          disabled={!aDessine}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink disabled:opacity-40"
        >
          Utiliser cette signature
        </button>
      </div>
    </div>
  );
}

function PanneauTexte({ nomParDefaut, onCree }: { nomParDefaut: string; onCree: (fichier: File) => void }) {
  const [texte, setTexte] = useState(nomParDefaut);
  const [styleId, setStyleId] = useState<(typeof STYLES_ECRITURE)[number]["id"]>("caveat");
  const style = STYLES_ECRITURE.find((s) => s.id === styleId) ?? STYLES_ECRITURE[0];

  const valider = async () => {
    if (!texte.trim()) return;
    await document.fonts.load(`48px ${style.font.style.fontFamily}`);

    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = `80px ${style.font.style.fontFamily}`;
    ctx.fillStyle = ENCRE;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(texte.trim(), canvas.width / 2, canvas.height / 2);

    onCree(await canvasVersFichier(canvas));
  };

  return (
    <div>
      <input
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder="Votre nom"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />

      <div className="mt-3 flex items-center justify-center rounded-lg border border-border bg-surface-2 py-8">
        <p style={{ fontFamily: style.font.style.fontFamily }} className="max-w-full truncate px-4 text-4xl text-ink">
          {texte.trim() || "Votre nom"}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        {STYLES_ECRITURE.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStyleId(s.id)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
              styleId === s.id ? "border-accent bg-accent-soft text-accent" : "border-border text-muted hover:text-ink"
            }`}
          >
            <span style={{ fontFamily: s.font.style.fontFamily }} className="text-base">
              {texte.trim().slice(0, 12) || "Aperçu"}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={valider}
          disabled={!texte.trim()}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink disabled:opacity-40"
        >
          Utiliser cette signature
        </button>
      </div>
    </div>
  );
}

function PanneauImport({ onCree }: { onCree: (fichier: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const traiterFichiers = (fileList: FileList | null) => {
    const f = fileList?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    onCree(f);
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
          traiterFichiers(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        animate={{ scale: dragOver ? 1.015 : 1 }}
        transition={{ duration: 0.15 }}
        className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragOver ? "border-accent bg-accent-soft" : "border-border bg-surface-2"
        }`}
      >
        <p className="text-sm font-medium">Glissez une image de signature ici, ou cliquez pour la choisir</p>
        <p className="mt-1 text-xs text-muted">Idéalement un PNG à fond transparent</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            traiterFichiers(e.target.files);
            e.target.value = "";
          }}
        />
      </motion.div>
    </div>
  );
}
