# PUT & GO — boutique en ligne

Site e-commerce de **PUT & GO** (mode femme, homme, enfant, chaussures et accessoires — Dakar, Sénégal).

- **Stack** : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4
- **Commerce** : Shopify Storefront API (catalogue, panier, checkout hébergé Shopify) + Admin API (newsletter, import en brouillon)
- **Hébergement** : Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare), déployé par Workers Builds à chaque push sur `main`
- **Langues** : `/fr` (défaut), `/en`, `/ar` (RTL)

## Principes

- **Shopify est la source de vérité** pour les produits, variantes, prix et stocks. Le site n'affiche que des produits publiés dans Shopify ; tant que la boutique n'est pas connectée, les rayons affichent un état vide honnête avec un lien vers le catalogue WhatsApp.
- **Aucun prix, stock, délai ou tarif de livraison n'est inventé.** Les frais et délais sont calculés au checkout Shopify ; seuls les pays configurés dans Shopify y sont proposés.
- **Pas de conversion de devise maison** : l'affichage multi-devises (XOF, EUR, USD, AED) passe par Shopify Markets (`@inContext(country)`), la devise de paiement est confirmée au checkout.
- Les **visuels éditoriaux temporaires** sont étiquetés comme tels et ne représentent jamais un article en vente.
- Le **logo officiel** (`public/brand/`) est utilisé tel quel (simple recadrage des marges noires).

## Structure

```
src/app/[lang]/            pages localisées (accueil, shop/[category], products/[handle], search, cart, wishlist, account, [page] infos)
src/app/admin/import/      interface de revue d'import (Instagram / WhatsApp → Shopify en BROUILLON)
src/app/api/               cart, country, newsletter, webhooks/shopify (HMAC), admin/import/publish
src/lib/shopify/           client GraphQL, requêtes, types
src/lib/import/            parsing CSV/JSON, déduplication, rapprochement des sources, contrôle qualité
src/i18n/                  dictionnaires fr / en / ar
src/content/pages.ts       contenus des pages d'information
tests/                     tests Vitest
```

## Développement

```bash
npm install
cp .env.example .dev.vars   # renseigner les valeurs locales
npm run dev                 # http://localhost:3000
npm run lint && npm run typecheck && npm test
npm run preview             # build OpenNext + runtime Workers local
```

## Variables et secrets (Cloudflare)

À définir dans **Cloudflare → Workers → put-and-go → Settings → Variables and secrets** (secrets chiffrés) — jamais dans le dépôt. Voir `.env.example`.

| Nom | Type | Rôle |
| --- | --- | --- |
| `SHOPIFY_STORE_DOMAIN` | variable | `xxx.myshopify.com` |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` (ou `_PUBLIC_TOKEN`) | secret | Storefront API (canal Headless) |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | secret | Admin API : `write_products`, `write_customers` |
| `SHOPIFY_WEBHOOK_SECRET` | secret | vérification HMAC des webhooks |
| `SHOPIFY_ACCOUNT_URL` | variable | URL des comptes clients Shopify (connexion, historique de commandes) |
| `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` | secret | galerie Instagram via l'API officielle |
| `IMPORT_ADMIN_TOKEN` | secret | accès à `/admin/import` (32+ caractères) |
| `HERO_IMAGE_URL`, `HERO_VIDEO_URL` | variable | visuel/vidéo d'accueil officiel |
| `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | variable **de build** | URL canonique, Web Analytics (après consentement) |

## Mise en route Shopify

1. Créer la boutique (pays du marchand : Sénégal) et installer le canal **Headless** → récupérer les jetons Storefront.
2. Créer les collections avec ces handles : `women`, `men`, `kids`, `shoes`, `accessories`, `new-arrivals`, `best-sellers`, `trending`, `collections`, `sale`. Les sous-catégories utilisent le *type de produit* (`dresses`, `jeans`…) ou un tag `sub:<clé>`.
3. Options produit : `Taille` / `Couleur` (ou `Size` / `Color`) pour activer les filtres.
4. **Paiements** : vérifier les passerelles disponibles pour un marchand au Sénégal (cartes, Orange Money, Wave via un prestataire compatible Shopify). Ne rien annoncer comme actif avant test.
5. **Livraison** : définir les zones (Sénégal, Afrique de l'Ouest, Afrique, France, Europe, EAU, international) et les tarifs réels des transporteurs retenus. Les pays non couverts restent désactivés.
6. **Markets** : activer XOF / EUR / USD / AED selon ce que la configuration de paiement autorise.
7. Webhooks → `https://<domaine>/api/webhooks/shopify` (products/update, orders/fulfilled…).

## Import du catalogue (Instagram / WhatsApp)

Instagram et le catalogue WhatsApp Business ne sont pas extraits automatiquement (pas d'API publique pour le catalogue WhatsApp, Instagram exige une connexion). Le flux prévu :

1. Exporter les produits (CSV/JSON — colonnes décrites dans l'outil) depuis WhatsApp Business / Meta Commerce Manager et, pour Instagram, via l'API officielle ou l'export de données du compte.
2. Ouvrir `/admin/import`, saisir `IMPORT_ADMIN_TOKEN`, charger les fichiers.
3. L'outil fusionne les doublons entre sources, signale les prix divergents, devises, photos, tailles ou rayons manquants et les prix anciens.
4. Corriger, choisir le prix vérifié, cocher « approuver ».
5. « Envoyer vers Shopify » crée les produits en **brouillon** ; l'activation finale se fait dans Shopify Admin.

## Déploiement

Workers Builds (Cloudflare ↔ GitHub) : build `npm run cf:build`, déploiement `npx opennextjs-cloudflare deploy` sur `main` ; les autres branches produisent des URLs de prévisualisation (`npx opennextjs-cloudflare upload`).
