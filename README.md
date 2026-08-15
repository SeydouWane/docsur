# Aegis-Num

Le bouclier numérique de vos documents d'entreprise : fusionner, convertir et
faire signer des PDF professionnels sans les exposer à des outils grand
public non contractualisés.

Le dossier de spécifications complet est dans [`docs/specifications.html`](docs/specifications.html)
(ouvrir dans un navigateur) — vision, périmètre fonctionnel, architecture,
modèle de données, sécurité et conformité.

## Décisions actées

- **Nom** : Aegis-Num.
- **Signature électronique** : chaîne open source auto-hébergée — [DSS](https://github.com/esig/dss)
  (LGPL, Commission européenne) pour la création/validation PAdES, [step-ca](https://smallstep.com/docs/step-ca/)
  pour l'autorité de certification interne, horodatage RFC 3161 auto-hébergé.
  Pas de dépendance à un prestataire commercial eIDAS pour les niveaux
  simple et avancé (détail en §7 des spécifications).
- **Conversions Office** : [Gotenberg](https://gotenberg.dev/) (LibreOffice +
  Chromium en conteneur) plutôt qu'un moteur maison — traitement serveur
  éphémère, rien n'est écrit sur disque côté API.
- **Chiffrement/réparation de PDF** : [qpdf](https://qpdf.readthedocs.io/)
  (bibliothèque C++ de référence) dans un microservice dédié — `pdf-lib` n'a
  pas de fonction de chiffrement fiable, et qpdf couvre aussi la réparation.
- **OCR** : [ocrmypdf](https://ocrmypdf.readthedocs.io/) + Tesseract (français
  et anglais) dans un microservice dédié — ajoute une couche de texte
  invisible par-dessus le rendu original des pages, sans jamais modifier
  l'apparence du document.
- **PDF → Office** : LibreOffice headless dans un microservice dédié, limité
  à Word et PowerPoint — LibreOffice sait reconstruire un document Writer ou
  Impress à partir d'un PDF (filtres d'import dédiés, vérifiés en pratique :
  le texte reste réellement éditable, pas juste une image), mais n'a aucun
  filtre d'import PDF vers Calc. PDF → Excel reste donc « bientôt » : ce
  serait un outil différent (détection de tableaux), pas juste un format de
  sortie en plus.

## Structure du dépôt

```
apps/
  web/           Next.js (App Router, TS, Tailwind, motion) — landing,
                 catalogue d'outils et outils PDF côté navigateur ou via l'API
  api/           NestJS + Prisma — enrôlement, RBAC, journal d'audit, email,
                 conversions, sécurité PDF, OCR
  pdf-securite/  Microservice Express + qpdf — protéger/déverrouiller/réparer/compresser
  pdf-ocr/       Microservice Express + ocrmypdf/Tesseract — OCR
  pdf-office/    Microservice Express + LibreOffice — PDF vers Word/PowerPoint
docs/
  specifications.html   Dossier de spécifications
```

## Démarrer en local

1. **Base de données** (Docker) :
   ```bash
   docker run -d --name docsur-postgres -e POSTGRES_USER=docsur -e POSTGRES_PASSWORD=docsur -e POSTGRES_DB=docsur -p 5544:5432 postgres:16-alpine
   ```
2. **Gotenberg** (Docker, conversions Office/HTML → PDF) :
   ```bash
   docker run -d --name aegis-gotenberg -p 3002:3000 gotenberg/gotenberg:8
   ```
3. **pdf-securite** (Docker, protéger/déverrouiller/réparer/compresser) :
   ```bash
   cd apps/pdf-securite
   docker build -t aegis-pdf-securite .
   docker run -d --name aegis-pdf-securite -p 3003:3003 aegis-pdf-securite
   ```
4. **pdf-ocr** (Docker, OCR — construction plus longue : installe Tesseract) :
   ```bash
   cd apps/pdf-ocr
   docker build -t aegis-pdf-ocr .
   docker run -d --name aegis-pdf-ocr -p 3004:3004 aegis-pdf-ocr
   ```
5. **pdf-office** (Docker, PDF → Word/PowerPoint — construction la plus
   longue : installe LibreOffice) :
   ```bash
   cd apps/pdf-office
   docker build -t aegis-pdf-office .
   docker run -d --name aegis-pdf-office -p 3005:3005 aegis-pdf-office
   ```
6. **API** :
   ```bash
   cd apps/api
   npm install
   npx prisma migrate dev
   npm run build
   node dist/main.js
   # http://localhost:3001
   ```
   Sous Windows, `npm run start:dev` (mode watch) plante parfois à cause d'un
   bug connu de `@nestjs/cli` (tree-kill) — `npm run build` puis `node dist/main.js`
   est plus fiable ; à relancer manuellement après chaque modification.
7. **Web**, dans un autre terminal :
   ```bash
   cd apps/web
   npm install
   npm run dev
   # http://localhost:3000
   ```

`apps/api/.env` et `apps/web/.env.local` (non versionnés) contiennent les
identifiants réels ; voir `apps/api/.env.example` pour le format attendu.

## apps/web

- `/` — landing.
- `/outils` — catalogue complet des outils PDF, organisé par catégorie ; chaque
  carte indique si le traitement est local (navigateur) ou serveur (chiffré,
  éphémère).
- `/outils/[slug]` — page « bientôt disponible » pour les outils du catalogue
  pas encore construits.
- `/inscription`, `/connexion`, `/tableau-de-bord` — branchés sur l'API réelle.

Outils fonctionnels à ce stade (pilier 3) :

| Outil | Traitement |
| --- | --- |
| Fusionner, Diviser, Supprimer/Extraire des pages, Réorganiser, Pivoter | Local (`pdf-lib` + aperçu `pdfjs-dist`) |
| Numéros de page, Filigrane, Rogner | Local, avec aperçu en direct |
| JPG en PDF, PDF en JPG, Numériser | Local (rendu `pdfjs-dist`) |
| Modifier PDF, Formulaires PDF | Local (édition/champs directement sur l'aperçu) |
| Comparer PDF | Local (diff visuel pixel par pixel) |
| Censurer PDF | Local (rédaction réelle par rasterisation de la page) |
| Word/PowerPoint/Excel/HTML en PDF | Serveur, via Gotenberg |
| Protéger, Déverrouiller, Réparer, Compresser | Serveur, via qpdf (`apps/pdf-securite`) |
| OCR PDF | Serveur, via ocrmypdf/Tesseract (`apps/pdf-ocr`) |
| PDF en Word, PDF en PowerPoint | Serveur, via LibreOffice (`apps/pdf-office`) |

Les outils locaux affichent et manipulent le document réellement rendu
(vignettes `pdfjs-dist`) plutôt que de simples champs texte.

## apps/api

Pilier 1 (console administrateur) :

- `POST /auth/inscription` — enrôlement par domaine email (ou compte
  individuel, forcé pour les domaines email publics) : le premier compte
  d'un domaine fonde l'organisation et devient administrateur.
- `POST /auth/connexion` — authentification, émission d'un JWT.
- `GET /auth/moi` — profil de l'utilisateur authentifié.
- `GET/PATCH /utilisateurs` — gestion des collaborateurs par l'ADMIN de leur
  organisation (activation/désactivation).
- `GET/POST /workspaces` — démembrements de l'organisation (équipes).
- `GET/PATCH /organisations` — vue et contrôle plateforme, réservés au
  superadmin (`Utilisateur.estSuperAdmin`).

Chaque compte suspendu ou organisation désactivée perd l'accès immédiatement
— vérifié en base à chaque requête (`JwtStrategy`), pas seulement à
l'expiration du token.

Pilier 3 (traitement serveur) :

- `POST /conversions/vers-pdf` — document Office (multipart) → PDF, via
  Gotenberg/LibreOffice.
- `POST /conversions/html-vers-pdf` — URL → PDF, via Gotenberg/Chromium ;
  URL validée côté serveur contre le SSRF (IP privées/locales rejetées).
- `POST /securite-pdf/proteger` — chiffre un PDF (AES-256) avec un mot de
  passe, via `apps/pdf-securite` (qpdf).
- `POST /securite-pdf/deverrouiller` — retire le mot de passe d'un PDF.
- `POST /securite-pdf/reparer` — reconstruit un PDF corrompu (table de
  références manquante ou invalide).
- `POST /securite-pdf/compresser` — recompresse flux et images (qpdf
  `--optimize-images --recompress-flate --object-streams=generate`).
- `POST /ocr` — ajoute une couche de texte reconnu sous chaque page scannée
  (français/anglais, au choix), via `apps/pdf-ocr` (ocrmypdf/Tesseract) ;
  les pages contenant déjà du texte sont laissées intactes (`--skip-text`).
- `POST /pdf-office/vers-word` — reconstruit un `.docx` éditable à partir
  d'un PDF, via `apps/pdf-office` (LibreOffice, filtre `writer_pdf_import`).
- `POST /pdf-office/vers-powerpoint` — reconstruit un `.pptx` éditable à
  partir d'un PDF, via `apps/pdf-office` (filtre `impress_pdf_import`).

Le schéma de données (`prisma/schema.prisma`) reflète le modèle documenté en
§6 : `Organisation`, `Utilisateur`, `Workspace`, `Document`, `LienPartage`,
`DemandeSignature`, `JournalAudit`.

## apps/pdf-securite

Microservice Express minimal (voir `apps/pdf-securite/src/qpdf.ts`) : chaque
requête écrit le fichier reçu dans un dossier temporaire unique, appelle le
binaire `qpdf`, lit le résultat puis supprime immédiatement le dossier —
rien ne persiste entre deux requêtes. Le verdict de réussite se base sur la
présence du fichier de sortie plutôt que sur le code de sortie de qpdf (qui
peut être non-nul pour de simples avertissements).

## apps/pdf-ocr

Microservice Express minimal (voir `apps/pdf-ocr/src/ocrmypdf.ts`), même
principe que `apps/pdf-securite` : dossier temporaire unique par requête,
supprimé immédiatement après. Appelle `ocrmypdf` avec `--skip-text` (les
pages qui ont déjà du texte sont laissées intactes) et `--optimize 0` (la
compression est le travail de l'outil Compresser, pas de celui-ci) ;
l'image Docker installe Tesseract avec les paquets de langue français et
anglais.

## apps/pdf-office

Microservice Express minimal (voir `apps/pdf-office/src/libreoffice.ts`) qui
pilote `soffice --headless --convert-to`. Deux points spécifiques à cette
conversion, absents des autres microservices :

- Gotenberg ne convertit que *vers* PDF ; il n'expose aucune route pour le
  sens inverse. `soffice` sait le faire directement (il a ses propres
  filtres d'import PDF pour Writer et Impress), d'où un microservice séparé
  plutôt qu'une route Gotenberg supplémentaire.
- Chaque requête tourne avec son propre profil utilisateur LibreOffice
  (`-env:UserInstallation` pointé vers le dossier temporaire de la requête) :
  plusieurs instances de `soffice` qui partageraient un même profil se
  verrouillent mutuellement sur des requêtes concurrentes.

PDF → Excel n'est pas proposé : vérifié en pratique, LibreOffice n'a
littéralement aucun filtre d'export vers Calc pour un import PDF (`Error: no
export filter`), quel que soit le filtre d'import demandé. Ce n'est pas un
réglage manquant — reconstruire un tableur depuis un PDF quelconque suppose
de détecter des tableaux, un problème différent de la reconstruction de
texte ou de diapositives.

## Prochaines étapes

Voir §11 du dossier de spécifications. Reste à construire : PDF → Excel (une
approche différente, par détection de tableaux, si elle est faite un jour),
et **Signer** (chaîne DSS + step-ca complète) — volontairement mis de côté
pour une session dédiée : c'est, à lui seul, un chantier plus vaste que tout
le reste du pilier 3 réuni (autorité de certification, horodatage RFC 3161,
PAdES), et le bâcler serait pire que de ne pas l'avoir.
