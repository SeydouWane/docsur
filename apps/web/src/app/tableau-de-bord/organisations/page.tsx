"use client";

import { useDashboard } from "../dashboard-context";
import { PlateformeSection } from "../plateforme-section";

export default function OrganisationsPage() {
  const { profil } = useDashboard();

  if (!profil.estSuperAdmin) {
    return <p className="text-sm text-muted">Réservé au superadmin de la plateforme.</p>;
  }

  return <PlateformeSection />;
}
