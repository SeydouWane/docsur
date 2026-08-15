"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Building2, User } from "lucide-react";
import { api, ApiError, setToken } from "@/lib/api";
import { Field } from "@/components/field";
import { AuthSplit } from "@/components/auth-split";

type TypeCompte = "entreprise" | "particulier";

export default function InscriptionPage() {
  const router = useRouter();
  const [typeCompte, setTypeCompte] = useState<TypeCompte>("entreprise");
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
      const session = await api.inscription({
        nom,
        email,
        motDePasse,
        individuel: typeCompte === "particulier",
      });
      setToken(session.accessToken);
      router.push("/tableau-de-bord");
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Impossible de créer le compte");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <AuthSplit citation={1}>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
      <p className="mb-3 font-mono text-xs uppercase tracking-wider text-accent">
        Pilier 1 · console administrateur
      </p>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">Créer votre compte</h1>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-2 p-1">
        {(
          [
            { value: "entreprise", label: "Entreprise", Icon: Building2 },
            { value: "particulier", label: "Particulier", Icon: User },
          ] as const
        ).map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTypeCompte(value)}
            className={`relative flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              typeCompte === value ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {typeCompte === value && (
              <motion.span
                layoutId="type-compte-actif"
                className="absolute inset-0 rounded-md bg-surface shadow-sm"
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              />
            )}
            <Icon size={14} className="relative" strokeWidth={1.75} />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted">
        {typeCompte === "entreprise"
          ? "Le premier compte créé sur votre domaine email fonde l'organisation et en devient administrateur."
          : "Votre espace personnel vous appartient en propre — jamais partagé avec d'autres comptes."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Nom complet" type="text" value={nom} onChange={setNom} required autoComplete="name" />
        <Field
          label={typeCompte === "entreprise" ? "Email professionnel" : "Email"}
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
    </AuthSplit>
  );
}
