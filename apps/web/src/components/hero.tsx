"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { ShieldCheck } from "lucide-react";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-48 h-[560px] w-[560px] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--brand-end) 0%, var(--brand-mid) 45%, transparent 72%)",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="relative grid gap-12 py-20 md:grid-cols-[1.05fr_0.95fr] md:items-center"
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
                className="inline-block rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink shadow-sm shadow-accent/20"
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

          <motion.div variants={item} className="mt-10 flex items-center gap-4 text-xs text-muted">
            <div className="flex -space-x-2">
              {["#0284c7", "#7c3aed", "#059669", "#db2777"].map((c) => (
                <span
                  key={c}
                  className="h-7 w-7 rounded-full border-2 border-bg"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            Conçu pour les équipes RH, juridique, finance et santé.
          </motion.div>
        </div>

        <motion.div variants={item} className="relative">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80"
              alt="Une équipe travaille ensemble sur des documents professionnels, ordinateurs portables ouverts"
              fill
              sizes="(min-width: 768px) 42vw, 90vw"
              className="object-cover"
              priority
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-6 -left-6 hidden max-w-[15rem] items-start gap-2.5 rounded-xl border border-border bg-surface/95 p-4 shadow-lg backdrop-blur sm:flex"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-good-soft text-good">
              <ShieldCheck size={16} strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-semibold">Chiffré et journalisé</p>
              <p className="mt-0.5 text-xs text-muted">Chaque action tracée — qui, quoi, quand.</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
