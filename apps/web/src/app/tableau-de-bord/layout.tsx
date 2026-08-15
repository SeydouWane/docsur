"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, clearToken, getToken, type Profil } from "@/lib/api";
import { DashboardProvider } from "./dashboard-context";
import { DashboardSidebar } from "./dashboard-sidebar";

export default function TableauDeBordLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profil, setProfil] = useState<Profil | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(() => {
    if (!getToken()) {
      router.replace("/connexion");
      return;
    }
    api
      .moi()
      .then(setProfil)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          router.replace("/connexion");
          return;
        }
        setErreur(err instanceof ApiError ? err.message : "Impossible de charger le tableau de bord");
      });
  }, [router]);

  useEffect(charger, [charger]);

  if (erreur) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <p className="rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
          {erreur}
        </p>
      </div>
    );
  }

  if (!profil) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-3 w-40 rounded bg-surface-2" />
          <div className="h-8 w-64 rounded bg-surface-2" />
          <div className="mt-6 h-64 rounded-lg bg-surface-2" />
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider profil={profil} actualiser={charger}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row">
        <DashboardSidebar profil={profil} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </DashboardProvider>
  );
}
