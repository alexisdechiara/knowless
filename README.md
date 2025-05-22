# Knowless

Knowless est une application web moderne développée avec Nuxt 3, conçue pour offrir une expérience de contenu riche et interactive. Elle s'appuie sur un ensemble complet de technologies web modernes pour garantir performance, évolutivité et une excellente expérience utilisateur.

## Fonctionnalités

Voici une liste des fonctionnalités clés que Knowless peut offrir :


  ✨ **Interface Utilisateur Moderne (UI/UX)** : Construite avec [Tailwind CSS](https://tailwindcss.com/) et [shadcn-nuxt](https://www.shadcn-vue.com/) (utilisant Radix Vue) pour une interface utilisateur élégante, responsive et personnalisable.

  📝 **Affichage de Contenu Riche** : Utilise [@nuxt/content](https://content.nuxt.com/) pour la gestion et l'affichage de contenu basé sur Markdown.

  🚀 **Éléments Interactifs** : Améliorée avec des animations ([@formkit/auto-animate](https://auto-animate.formkit.com/), [motion-v](https://motion.vueuse.org/)) et des composants UI ([Radix Vue](https://www.radix-vue.com/)).

  💾 **Gestion d'État** : Utilise [Pinia](https://pinia.vuejs.org/) pour une gestion d'état robuste et évolutive, avec persistance via `pinia-plugin-persistedstate`.

  ✅ **Gestion des Formulaires** : Implémente VeeValidate et Zod pour une validation de formulaire puissante et typée.

  🔑 **Intégration Backend (Supabase)** : Utilise Supabase via `@nuxtjs/supabase` pour la base de données, l'authentification, et plus encore.

  🖼️ **Optimisation d'Images** : Tire parti de @nuxt/image pour une diffusion optimisée des images.

  📈 **Optimisée pour le SEO** : Conçue avec @nuxtjs/seo pour améliorer la visibilité sur les moteurs de recherche.

  ✨ **Iconographie** : Utilise Lucide Icons via @nuxt/icon pour une large gamme d'icônes vectorielles.

  🔔 **Notifications** : Implémente vue-sonner pour les notifications utilisateur.

  📱 **Détection d'Appareil** : S'adapte aux différents appareils grâce à @nuxtjs/device.

  👤 **Avatars Génératifs** : Peut utiliser @dicebear/core pour générer des avatars.

## Structure du Projet

Voici une vue d'ensemble de la structure typique d'un projet Nuxt 3 :

```plaintext
knowless/
├── .nuxt/            # Fichiers générés par Nuxt (ne pas modifier)
├── .output/          # Sortie de la compilation (build)
├── assets/           # Ressources non compilées (CSS, SASS, images, polices)
├── components/       # Composants Vue globaux
├── composables/      # Fonctions composables Vue réutilisables
├── content/          # Fichiers Markdown pour @nuxt/content
├── layouts/          # Mises en page de l'application
├── middleware/       # Middlewares de route
├── node_modules/     # Dépendances du projet (gérées par bun)
├── pages/            # Pages et routes de l'application
├── plugins/          # Plugins Vue
├── public/           # Ressources statiques servies directement
│   └── licenses.json # Fichier généré des licences des dépendances
├── server/           # Logique côté serveur (API, middleware)
├── stores/           # Modules Pinia pour la gestion d'état
├── utils/            # Fonctions utilitaires
├── app.vue           # Composant Vue racine de l'application
├── nuxt.config.ts    # Fichier de configuration Nuxt
├── package.json      # Dépendances et scripts du projet
├── bun.lockb         # Fichier de verrouillage des dépendances Bun
├── tsconfig.json     # Configuration TypeScript
└── README.md         # Ce fichier
```

## Prérequis

*   Node.js (version LTS recommandée, ex: v18 ou v20+)
*   [Bun](https://bun.sh/)

## Installation

1.  Clonez le dépôt (si ce n'est pas déjà fait) :
    ```bash
    gh repo clone alexisdechiara/knowless
    cd knowless
    ```

2.  Installez les dépendances :
    ```bash
    bun install
    ```

## Développement
Pour démarrer le serveur de développement avec rechargement à chaud :

```bash
bun run dev
```

L'application sera généralement accessible à l'adresse `http://localhost:3000`. L'option `--host` dans le script `dev` (configurée dans `package.json`) permet d'accéder au serveur de développement depuis d'autres appareils sur le même réseau.

## Compilation (Build)

Pour compiler l'application pour la production :

```bash
bun run build
```

Les fichiers compilés seront placés dans le répertoire `.output`.

## Prévisualisation de la Build de Production

Pour prévisualiser la build de production localement avant le déploiement :

```bash
bun run preview
```

## Scripts disponibles

Le fichier `package.json` définit plusieurs scripts utiles, exécutables avec `bun run <nom-du-script>`:

*   `"build": "nuxt build"`: Compile l'application pour la production.
*   `"dev": "nuxt dev --host"`: Démarre le serveur de développement avec l'option `--host`.
*   `"generate": "nuxt generate"`: Génère une version statique de l'application.
*   `"preview": "nuxt preview"`: Sert la build de production localement pour la prévisualisation.
*   `"postinstall": "nuxt prepare"`: Exécute les préparations Nuxt nécessaires après l'installation des dépendances (génération de types, etc.). Ce script est généralement exécuté automatiquement par `bun install`.
*   `"generate-licenses": "license-report --only=prod --config license-report-config.json > public/licenses.json"`: Génère un rapport des licences des dépendances de production et le sauvegarde dans `public/licenses.json`.

## Contribuer

Les contributions sont les bienvenues ! Si vous souhaitez contribuer, veuillez suivre le workflow standard :

1.  Forkez le projet.
2.  Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`).
3.  Commitez vos changements (`git commit -m 'Add some AmazingFeature'`).
4.  Poussez vers la branche (`git push origin feature/AmazingFeature`).
5.  Ouvrez une Pull Request.

Assurez-vous que votre code respecte les standards de linting du projet.

## Licence

Ce projet est sous licence [GPLv3](/LICENSE.txt).

Les informations sur les licences des dépendances utilisées dans ce projet sont disponibles dans le fichier `public/licenses.json`, qui peut être généré en exécutant la commande `bun run generate-licenses`.