# DocSur

Plateforme documentaire B2B : fusionner, convertir et faire signer des PDF
professionnels sans les exposer à des outils grand public non contractualisés.

Le dossier de spécifications complet est dans [`docs/specifications.html`](docs/specifications.html)
(ouvrir dans un navigateur) — vision, périmètre fonctionnel, architecture,
modèle de données, sécurité et conformité.

## Décisions actées

- **Nom** : DocSur.
- **Signature électronique** : chaîne open source auto-hébergée — [DSS](https://github.com/esig/dss)
  (LGPL, Commission européenne) pour la création/validation PAdES, [step-ca](https://smallstep.com/docs/step-ca/)
  pour l'autorité de certification interne, horodatage RFC 3161 auto-hébergé.
  Pas de dépendance à un prestataire commercial eIDAS pour les niveaux
  simple et avancé (détail en §7 des spécifications).

## Structure du dépôt

```
apps/
  web/    Next.js (App Router, TS, Tailwind) — landing + outils PDF côté navigateur
  api/    NestJS + Prisma — enrôlement, RBAC, journal d'audit
docs/
  specifications.html   Dossier de spécifications
```

## apps/web

Landing page et premier outil du pilier 3 (**Fusionner un PDF**), entièrement
côté navigateur avec `pdf-lib` — aucun fichier n'est envoyé à un serveur pour
cette opération, conformément au principe « traitement au plus près de la
donnée » (§5).

```bash
cd apps/web
npm install
npm run dev
# http://localhost:3000
```

## apps/api

Squelette du pilier 1 (console administrateur) :

- `POST /auth/inscription` — enrôlement par domaine email : le premier compte
  d'un domaine fonde l'organisation et devient administrateur, les suivants
  rejoignent l'organisation en tant que collaborateurs.
- `POST /auth/connexion` — authentification, émission d'un JWT.
- `GET /auth/moi` — profil de l'utilisateur authentifié.
- `GET /documents` — métadonnées des documents de l'organisation (RBAC via
  `JwtAuthGuard` + `@Roles()`).

Chaque inscription et connexion écrit une entrée dans `JournalAudit`
(`AuditService`), conformément à l'exigence de traçabilité du §7.

```bash
cd apps/api
cp .env.example .env   # renseigner DATABASE_URL (PostgreSQL)
npm install
npx prisma migrate dev --name init
npm run start:dev
# http://localhost:3001
```

Le schéma de données (`prisma/schema.prisma`) reflète le modèle documenté en
§6 : `Organisation`, `Utilisateur`, `Workspace`, `Document`, `LienPartage`,
`DemandeSignature`, `JournalAudit`.

## Prochaines étapes

Voir §11 du dossier de spécifications — notamment le déploiement d'une
instance de test de la chaîne de signature (DSS + step-ca) et la suite du
pilier 3 (conversion, OCR, censure réelle).
