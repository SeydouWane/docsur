// Traduit les identifiants d'action bruts du journal (ex. "signature.signer")
// en libellés lisibles. Volontairement tolérant : une action inconnue
// s'affiche telle quelle plutôt que de faire échouer l'affichage — le
// journal doit rester lisible même après l'ajout d'un nouvel outil ici non
// répertorié.
const LIBELLES: Record<string, string> = {
  "organisation.activation": "Organisation réactivée",
  "organisation.desactivation": "Organisation désactivée",
  "utilisateur.reactivation": "Collaborateur réactivé",
  "utilisateur.desactivation": "Collaborateur désactivé",
  "conversions.vers_pdf": "Document Office converti en PDF",
  "conversions.html_vers_pdf": "Page web convertie en PDF",
  "securite_pdf.proteger": "PDF protégé par mot de passe",
  "securite_pdf.deverrouiller": "PDF déverrouillé",
  "securite_pdf.reparer": "PDF réparé",
  "securite_pdf.compresser": "PDF compressé",
  "ocr.reconnaitre": "OCR appliqué à un PDF",
  "pdf_office.vers_word": "PDF converti en Word",
  "pdf_office.vers_powerpoint": "PDF converti en PowerPoint",
  "signature.signer": "Document signé électroniquement",
};

export function libelleAction(action: string): string {
  return LIBELLES[action] ?? action;
}

export function formatHorodatage(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
