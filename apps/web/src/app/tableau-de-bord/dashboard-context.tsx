"use client";

import { createContext, useContext } from "react";
import type { Profil } from "@/lib/api";

type DashboardContextValue = {
  profil: Profil;
  actualiser: () => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  profil,
  actualiser,
  children,
}: DashboardContextValue & { children: React.ReactNode }) {
  return <DashboardContext.Provider value={{ profil, actualiser }}>{children}</DashboardContext.Provider>;
}

// Chaque page du tableau de bord vit sous le layout qui garantit le profil
// chargé avant tout rendu — cette erreur ne devrait donc jamais survenir en
// dehors d'un usage hors arborescence /tableau-de-bord.
export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard doit être utilisé sous /tableau-de-bord");
  return ctx;
}
