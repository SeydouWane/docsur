// Garde-fou SSRF : Gotenberg récupère l'URL depuis son propre conteneur,
// sur le même réseau Docker que le reste de la plateforme. Sans ce filtre,
// n'importe qui pourrait faire sonder des services internes (base de
// données, métadonnées cloud en production) via ce endpoint.
const HOTES_INTERDITS = new Set(["localhost", "0.0.0.0", "::1"]);

function estIpPrivee(hote: string): boolean {
  const v4 = hote.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = v4.slice(1).map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // link-local / métadonnées cloud
    return false;
  }
  return hote === "::1" || hote.startsWith("fc") || hote.startsWith("fd") || hote.startsWith("fe80");
}

export function validerUrlPublique(valeur: string): { ok: true; url: URL } | { ok: false; raison: string } {
  let url: URL;
  try {
    url = new URL(valeur);
  } catch {
    return { ok: false, raison: "URL invalide" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, raison: "Seules les URL http(s) sont acceptées" };
  }
  if (HOTES_INTERDITS.has(url.hostname.toLowerCase()) || estIpPrivee(url.hostname)) {
    return { ok: false, raison: "Cette adresse n'est pas accessible" };
  }

  return { ok: true, url };
}
