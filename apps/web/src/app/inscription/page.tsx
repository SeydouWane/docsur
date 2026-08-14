"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { api, ApiError, setToken } from "@/lib/api";
import { Field } from "@/components/field";

export default function InscriptionPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      const session = await api.inscription({ nom, email, motDePasse });
      setToken(session.accessToken);
      router.push("/tableau-de-bord");
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Impossible de créer le compte");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-sm px-6 py-20"
    >
      <p className="mb-3 font-mono text-xs uppercase tracking-wider text-accent">
        Pilier 1 · console administrateur
      </p>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">
        Créer votre organisation
      </h1>
      <p className="mt-2 text-sm text-muted">
        Le premier compte créé sur votre domaine email fonde l&apos;organisation et
        en devient administrateur.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Nom complet" type="text" value={nom} onChange={setNom} required autoComplete="name" />
        <Field
          label="Email professionnel"
          type="email"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
        <Field
          label="Mot de passe"
          type="password"
          value={motDePasse}
          onChange={setMotDePasse}
          required
          minLength={10}
          autoComplete="new-password"
          hint="10 caractères minimum"
        />

        <AnimatePresence>
          {erreur && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700"
            >
              {erreur}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: envoi ? 1 : 1.015 }}
          whileTap={{ scale: envoi ? 1 : 0.985 }}
          type="submit"
          disabled={envoi}
          className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-50"
        >
          {envoi ? "Création…" : "Créer le compte"}
        </motion.button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="text-accent">
          Se connecter
        </Link>
      </p>
    </motion.div>
  );
}
