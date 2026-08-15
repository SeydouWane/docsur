const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const TOKEN_KEY = "docsur_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (Array.isArray(body.message)) return body.message.join(", ");
    if (typeof body.message === "string") return body.message;
  } catch {
    // réponse non JSON, on retombe sur le statut HTTP
  }
  return `Erreur ${res.status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Pas de Content-Type forcé ici : un envoi FormData (fichier) a besoin que
// le navigateur pose lui-même l'en-tête avec la bonne frontière multipart.
async function requestBlob(path: string, init?: RequestInit): Promise<Blob> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }
  return res.blob();
}

export type Session = { accessToken: string };

export type Profil = {
  id: string;
  email: string;
  nom: string;
  role: "ADMIN" | "MANAGER" | "COLLABORATEUR" | "INVITE_EXTERNE";
  statut: "ACTIF" | "INVITE" | "SUSPENDU";
  mfaActif: boolean;
  estSuperAdmin: boolean;
  organisation: {
    id: string;
    nom: string;
    region: string;
    type: "ENTREPRISE" | "INDIVIDUEL";
    statut: "ACTIVE" | "DESACTIVEE";
  };
};

export type DocumentMeta = {
  id: string;
  nom: string;
  tailleOctets: number;
  createdAt: string;
  datePurgePrevue: string | null;
  workspace: { id: string; nom: string };
};

export type Membre = {
  id: string;
  email: string;
  nom: string;
  role: Profil["role"];
  statut: Profil["statut"];
  createdAt: string;
};

export type Workspace = {
  id: string;
  nom: string;
  retentionJours: number;
  createdAt: string;
  _count: { membres: number; documents: number };
};

export type EntreeAudit = {
  id: string;
  action: string;
  horodatage: string;
  metadonnees: Record<string, unknown> | null;
  acteur: { nom: string; email: string } | null;
};

export type Organisation = {
  id: string;
  nom: string;
  domaineEmail: string;
  type: "ENTREPRISE" | "INDIVIDUEL";
  statut: "ACTIVE" | "DESACTIVEE";
  region: string;
  planTarifaire: string;
  createdAt: string;
  _count: { utilisateurs: number; workspaces: number };
};

export const api = {
  inscription: (dto: { email: string; motDePasse: string; nom: string; individuel?: boolean }) =>
    request<Session>("/auth/inscription", { method: "POST", body: JSON.stringify(dto) }),
  connexion: (dto: { email: string; motDePasse: string }) =>
    request<Session>("/auth/connexion", { method: "POST", body: JSON.stringify(dto) }),
  moi: () => request<Profil>("/auth/moi"),
  documents: () => request<DocumentMeta[]>("/documents"),

  // Admin — gestion des collaborateurs de sa propre organisation.
  membres: () => request<Membre[]>("/utilisateurs"),
  changerStatutMembre: (id: string, statut: "ACTIF" | "SUSPENDU") =>
    request<Membre>(`/utilisateurs/${id}/statut`, { method: "PATCH", body: JSON.stringify({ statut }) }),

  // Admin — démembrements (équipes) de l'organisation.
  workspaces: () => request<Workspace[]>("/workspaces"),
  creerWorkspace: (nom: string) =>
    request<Workspace>("/workspaces", { method: "POST", body: JSON.stringify({ nom }) }),

  // Superadmin — vue plateforme.
  organisations: () => request<Organisation[]>("/organisations"),
  changerStatutOrganisation: (id: string, statut: "ACTIVE" | "DESACTIVEE") =>
    request<Organisation>(`/organisations/${id}/statut`, {
      method: "PATCH",
      body: JSON.stringify({ statut }),
    }),

  // Journal d'audit — portée automatique selon le rôle de l'appelant
  // (superadmin: plateforme entière ; admin: son organisation ; les autres:
  // leurs propres actions), jamais un paramètre choisi côté client.
  audit: (options?: { limite?: number; action?: string }) => {
    const params = new URLSearchParams();
    if (options?.limite) params.set("limite", String(options.limite));
    if (options?.action) params.set("action", options.action);
    const qs = params.toString();
    return request<EntreeAudit[]>(`/audit${qs ? `?${qs}` : ""}`);
  },

  // Conversions — pilier 3, traitement serveur éphémère (LibreOffice/Chromium).
  officeVersPdf: (fichier: File) => {
    const formData = new FormData();
    formData.append("fichier", fichier);
    return requestBlob("/conversions/vers-pdf", { method: "POST", body: formData });
  },
  htmlVersPdf: (url: string) =>
    requestBlob("/conversions/html-vers-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }),

  // Sécurité PDF — pilier 3, traitement serveur éphémère (qpdf).
  protegerPdf: (fichier: File, motDePasse: string) => {
    const formData = new FormData();
    formData.append("fichier", fichier);
    formData.append("motDePasse", motDePasse);
    return requestBlob("/securite-pdf/proteger", { method: "POST", body: formData });
  },
  deverrouillerPdf: (fichier: File, motDePasse: string) => {
    const formData = new FormData();
    formData.append("fichier", fichier);
    formData.append("motDePasse", motDePasse);
    return requestBlob("/securite-pdf/deverrouiller", { method: "POST", body: formData });
  },
  reparerPdf: (fichier: File) => {
    const formData = new FormData();
    formData.append("fichier", fichier);
    return requestBlob("/securite-pdf/reparer", { method: "POST", body: formData });
  },
  compresserPdf: (fichier: File) => {
    const formData = new FormData();
    formData.append("fichier", fichier);
    return requestBlob("/securite-pdf/compresser", { method: "POST", body: formData });
  },

  // OCR — pilier 3, traitement serveur éphémère (ocrmypdf + Tesseract).
  ocrPdf: (fichier: File, langue: "fra" | "eng" | "fra+eng") => {
    const formData = new FormData();
    formData.append("fichier", fichier);
    formData.append("langue", langue);
    return requestBlob("/ocr", { method: "POST", body: formData });
  },

  // PDF → Office — pilier 3, traitement serveur éphémère (LibreOffice).
  pdfVersWord: (fichier: File) => {
    const formData = new FormData();
    formData.append("fichier", fichier);
    return requestBlob("/pdf-office/vers-word", { method: "POST", body: formData });
  },
  pdfVersPowerpoint: (fichier: File) => {
    const formData = new FormData();
    formData.append("fichier", fichier);
    return requestBlob("/pdf-office/vers-powerpoint", { method: "POST", body: formData });
  },

  // Signature électronique — pilier 3, chaîne PAdES/DSS + step-ca + RFC 3161.
  // Authentifié : le nom gravé dans le certificat est celui du compte
  // connecté, jamais une valeur envoyée par le client.
  signerPdf: (
    fichier: File,
    image: File,
    zone: { page: number; x: number; y: number; largeur: number; hauteur: number },
  ) => {
    const formData = new FormData();
    formData.append("fichier", fichier);
    formData.append("image", image);
    formData.append("page", String(zone.page));
    formData.append("x", String(zone.x));
    formData.append("y", String(zone.y));
    formData.append("largeur", String(zone.largeur));
    formData.append("hauteur", String(zone.hauteur));
    return requestBlob("/signature/signer", { method: "POST", body: formData });
  },
};
