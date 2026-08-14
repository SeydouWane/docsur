import type { LucideIcon } from "lucide-react";
import {
  Merge,
  Split,
  Trash2,
  FileOutput,
  ListOrdered,
  ScanLine,
  Gauge,
  Wrench,
  ScanText,
  FileImage,
  FileText,
  Presentation,
  Sheet,
  Globe,
  FileArchive,
  RotateCw,
  Hash,
  Droplets,
  Crop,
  Edit3,
  ClipboardList,
  Unlock,
  Lock,
  PenLine,
  EyeOff,
  GitCompare,
} from "lucide-react";

export type Traitement = "local" | "serveur";
export type Statut = "disponible" | "bientot";

export type Outil = {
  slug: string;
  nom: string;
  description: string;
  icon: LucideIcon;
  traitement: Traitement;
  statut: Statut;
};

export type Categorie = {
  id: string;
  label: string;
  description: string;
  outils: Outil[];
};

export const categories: Categorie[] = [
  {
    id: "organiser",
    label: "Organiser",
    description: "Recomposer un PDF : assembler, séparer, réordonner ses pages.",
    outils: [
      {
        slug: "fusionner",
        nom: "Fusionner PDF",
        description: "Assembler plusieurs PDF en un seul document, dans l'ordre voulu.",
        icon: Merge,
        traitement: "local",
        statut: "disponible",
      },
      {
        slug: "diviser",
        nom: "Diviser PDF",
        description: "Séparer un PDF en plusieurs fichiers, par plage de pages.",
        icon: Split,
        traitement: "local",
        statut: "disponible",
      },
      {
        slug: "supprimer-pages",
        nom: "Supprimer des pages",
        description: "Retirer une ou plusieurs pages d'un document existant.",
        icon: Trash2,
        traitement: "local",
        statut: "disponible",
      },
      {
        slug: "extraire-pages",
        nom: "Extraire des pages",
        description: "Isoler une sélection de pages dans un nouveau PDF.",
        icon: FileOutput,
        traitement: "local",
        statut: "disponible",
      },
      {
        slug: "reorganiser",
        nom: "Réorganiser les pages",
        description: "Changer l'ordre des pages, ou en retirer.",
        icon: ListOrdered,
        traitement: "local",
        statut: "disponible",
      },
      {
        slug: "numeriser",
        nom: "Numériser au format PDF",
        description: "Transformer des photos de documents prises au mobile en PDF net.",
        icon: ScanLine,
        traitement: "serveur",
        statut: "bientot",
      },
    ],
  },
  {
    id: "optimiser",
    label: "Optimiser",
    description: "Réduire, réparer ou rendre indexable un PDF existant.",
    outils: [
      {
        slug: "compresser",
        nom: "Compresser PDF",
        description: "Réduire la taille du fichier en conservant une qualité lisible.",
        icon: Gauge,
        traitement: "local",
        statut: "bientot",
      },
      {
        slug: "reparer",
        nom: "Réparer PDF",
        description: "Reconstruire un PDF corrompu ou qui ne s'ouvre plus.",
        icon: Wrench,
        traitement: "serveur",
        statut: "bientot",
      },
      {
        slug: "ocr",
        nom: "OCR PDF",
        description: "Rendre un PDF scanné sélectionnable, copiable et indexable.",
        icon: ScanText,
        traitement: "serveur",
        statut: "bientot",
      },
    ],
  },
  {
    id: "convertir-en-pdf",
    label: "Convertir en PDF",
    description: "Transformer un fichier bureautique ou une image en PDF fidèle.",
    outils: [
      {
        slug: "jpg-vers-pdf",
        nom: "JPG en PDF",
        description: "Regrouper une ou plusieurs images dans un PDF.",
        icon: FileImage,
        traitement: "local",
        statut: "disponible",
      },
      {
        slug: "word-vers-pdf",
        nom: "Word en PDF",
        description: "Convertir un document Word en PDF, mise en page conservée.",
        icon: FileText,
        traitement: "serveur",
        statut: "disponible",
      },
      {
        slug: "powerpoint-vers-pdf",
        nom: "PowerPoint en PDF",
        description: "Convertir une présentation en PDF prêt à partager.",
        icon: Presentation,
        traitement: "serveur",
        statut: "disponible",
      },
      {
        slug: "excel-vers-pdf",
        nom: "Excel en PDF",
        description: "Convertir un classeur Excel en PDF, feuilles et mises en page conservées.",
        icon: Sheet,
        traitement: "serveur",
        statut: "disponible",
      },
      {
        slug: "html-vers-pdf",
        nom: "HTML en PDF",
        description: "Convertir une page web en PDF à partir de son adresse.",
        icon: Globe,
        traitement: "serveur",
        statut: "disponible",
      },
    ],
  },
  {
    id: "convertir-depuis-pdf",
    label: "Convertir depuis PDF",
    description: "Repartir d'un PDF vers un format éditable ou une image.",
    outils: [
      {
        slug: "pdf-vers-jpg",
        nom: "PDF en JPG",
        description: "Exporter chaque page en fichier JPG.",
        icon: FileImage,
        traitement: "local",
        statut: "disponible",
      },
      {
        slug: "pdf-vers-word",
        nom: "PDF en Word",
        description: "Récupérer un document PDF sous forme de fichier Word éditable.",
        icon: FileText,
        traitement: "serveur",
        statut: "bientot",
      },
      {
        slug: "pdf-vers-powerpoint",
        nom: "PDF en PowerPoint",
        description: "Récupérer un PDF sous forme de présentation éditable.",
        icon: Presentation,
        traitement: "serveur",
        statut: "bientot",
      },
      {
        slug: "pdf-vers-excel",
        nom: "PDF en Excel",
        description: "Extraire les tableaux d'un PDF vers un classeur Excel.",
        icon: Sheet,
        traitement: "serveur",
        statut: "bientot",
      },
      {
        slug: "pdf-vers-pdfa",
        nom: "PDF en PDF/A",
        description: "Convertir vers le standard ISO d'archivage à long terme.",
        icon: FileArchive,
        traitement: "serveur",
        statut: "bientot",
      },
    ],
  },
  {
    id: "modifier",
    label: "Modifier",
    description: "Retoucher la mise en forme d'un PDF sans changer son contenu de fond.",
    outils: [
      {
        slug: "pivoter",
        nom: "Faire pivoter PDF",
        description: "Corriger l'orientation d'une ou plusieurs pages.",
        icon: RotateCw,
        traitement: "local",
        statut: "disponible",
      },
      {
        slug: "numeros-page",
        nom: "Ajouter des numéros de page",
        description: "Numéroter les pages : position, style et format au choix.",
        icon: Hash,
        traitement: "local",
        statut: "disponible",
      },
      {
        slug: "filigrane",
        nom: "Ajouter un filigrane",
        description: "Poser un texte en surimpression sur chaque page.",
        icon: Droplets,
        traitement: "local",
        statut: "disponible",
      },
      {
        slug: "rogner",
        nom: "Rogner PDF",
        description: "Recadrer les marges des pages.",
        icon: Crop,
        traitement: "local",
        statut: "disponible",
      },
      {
        slug: "modifier",
        nom: "Modifier PDF",
        description: "Ajouter texte, images ou formes directement sur le document.",
        icon: Edit3,
        traitement: "local",
        statut: "bientot",
      },
    ],
  },
  {
    id: "formulaires",
    label: "Formulaires",
    description: "Rendre un PDF interactif et exploitable comme un formulaire.",
    outils: [
      {
        slug: "formulaires",
        nom: "Formulaires PDF",
        description: "Détecter ou créer des champs de formulaire remplissables.",
        icon: ClipboardList,
        traitement: "serveur",
        statut: "bientot",
      },
    ],
  },
  {
    id: "securite",
    label: "Sécurité",
    description: "Contrôler qui peut lire, modifier ou engager sa signature sur un document.",
    outils: [
      {
        slug: "deverrouiller",
        nom: "Déverrouiller PDF",
        description: "Retirer un mot de passe dont vous disposez déjà.",
        icon: Unlock,
        traitement: "local",
        statut: "bientot",
      },
      {
        slug: "proteger",
        nom: "Protéger PDF",
        description: "Chiffrer un PDF avec un mot de passe d'ouverture.",
        icon: Lock,
        traitement: "local",
        statut: "bientot",
      },
      {
        slug: "signer",
        nom: "Signer PDF",
        description: "Signature électronique PAdES, sur chaîne open source auto-hébergée.",
        icon: PenLine,
        traitement: "serveur",
        statut: "bientot",
      },
      {
        slug: "censurer",
        nom: "Censurer PDF",
        description: "Supprimer définitivement un contenu sensible, pas seulement le masquer.",
        icon: EyeOff,
        traitement: "serveur",
        statut: "bientot",
      },
      {
        slug: "comparer",
        nom: "Comparer PDF",
        description: "Repérer les différences entre deux versions d'un même document.",
        icon: GitCompare,
        traitement: "serveur",
        statut: "bientot",
      },
    ],
  },
];

export const tousLesOutils: Outil[] = categories.flatMap((c) => c.outils);

export function trouverOutil(slug: string): Outil | undefined {
  return tousLesOutils.find((o) => o.slug === slug);
}

export function trouverCategorieDe(slug: string): Categorie | undefined {
  return categories.find((c) => c.outils.some((o) => o.slug === slug));
}
