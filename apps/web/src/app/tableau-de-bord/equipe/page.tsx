"use client";

import { useDashboard } from "../dashboard-context";
import { EquipeSection } from "../equipe-section";

export default function EquipePage() {
  const { profil } = useDashboard();

  if (profil.role !== "ADMIN" || profil.organisation.type !== "ENTREPRISE") {
    return <p className="text-sm text-muted">Réservé aux administrateurs d&apos;une organisation.</p>;
  }

  return (
    <div>
      <p className="text-sm text-muted">Gérez les collaborateurs et les espaces de travail de {profil.organisation.nom}.</p>
      <EquipeSection monId={profil.id} />
    </div>
  );
}
