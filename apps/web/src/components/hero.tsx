"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const points = [
  "Le fichier ne quitte pas le poste pour fusionner, diviser ou pivoter.",
  "Tout traitement serveur est chiffré, éphémère et purgé automatiquement.",
  "Chaque action est journalisée — qui, quoi, quand.",
  "Signature électronique sur chaîne open source, auto-hébergée.",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-48 h-[560px] w-[560px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--brand-end) 0%, var(--brand-mid) 45%, transparent 72%)",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative grid gap-10 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center"
      >
        <div>
          <motion.p variants={item} className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
            SaaS documentaire B2B
          </motion.p>
          <motion.h1
            variants={item}
            className="text-balance font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl"
          >
            La simplicité d&apos;un outil PDF grand public, la maîtrise en plus.
          </motion.h1>
          <motion.p variants={item} className="mt-5 max-w-xl text-lg text-muted">
            Vos équipes RH, juridique et finance fusionnent, convertissent et
            signent des documents sensibles chaque semaine. Aegis-Num leur
            donne les mêmes gestes simples, sans faire quitter le fichier du
            périmètre de l&apos;entreprise.
          </motion.p>
          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <Link href="/outils/fusionner">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink"
              >
                Essayer la fusion PDF
              </motion.span>
            </Link>
            <Link href="/outils">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink"
              >
                Voir tous les outils
              </motion.span>
            </Link>
          </motion.div>
        </div>

        <motion.div variants={item} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <p className="mb-4 font-mono text-xs uppercase tracking-wider text-muted">Ce que ça change</p>
          <motion.ul variants={container} className="space-y-3 text-sm">
            {points.map((p) => (
              <motion.li key={p} variants={item} className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-good" />
                {p}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.div>
    </section>
  );
}
