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

export type Session = { accessToken: string };

export type Profil = {
  id: string;
  email: string;
  nom: string;
  role: "ADMIN" | "MANAGER" | "COLLABORATEUR" | "INVITE_EXTERNE";
  statut: "ACTIF" | "INVITE" | "SUSPENDU";
  mfaActif: boolean;
  organisation: { id: string; nom: string; region: string };
};

export type DocumentMeta = {
  id: string;
  nom: string;
  tailleOctets: number;
  createdAt: string;
  datePurgePrevue: string | null;
  workspace: { id: string; nom: string };
};

export const api = {
  inscription: (dto: { email: string; motDePasse: string; nom: string }) =>
    request<Session>("/auth/inscription", { method: "POST", body: JSON.stringify(dto) }),
  connexion: (dto: { email: string; motDePasse: string }) =>
    request<Session>("/auth/connexion", { method: "POST", body: JSON.stringify(dto) }),
  moi: () => request<Profil>("/auth/moi"),
  documents: () => request<DocumentMeta[]>("/documents"),
};
