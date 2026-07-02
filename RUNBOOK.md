# Runbook : Échec du pipeline CI/CD — Build Vite échoué

## 1. Sujet

Échec du pipeline GitHub Actions lors du build Docker : l'étape `npm run build` (Vite + TypeScript) échoue.

## 2. Problème traité

Le pipeline CI/CD échoue à l'étape `docker/build-push-action` avec une erreur de type :

```
Error: Build failed with errors
src/App.tsx(42,5): error TS2322: Type 'X' is not assignable to type 'Y'
```

ou

```
Error: Could not resolve entry module "src/main.tsx"
```

Cela bloque le déploiement du frontend et empêche la mise en production.

## 3. Symptômes

- Le workflow GitHub Actions est marqué en **rouge** sur la branche `main`
- L'étape "Build Docker image" échoue
- Les logs contiennent des **erreurs TypeScript** (type mismatch, missing module)
- Ou les logs contiennent : `ENOENT: no such file or directory` (fichier manquant)
- L'image Docker n'est pas poussée sur DockerHub

## 4. Public cible

- Développeur frontend (niveau bac+3)
- DevOps junior en charge du pipeline CI/CD
- Toute personne ayant les droits de commit sur la branche `main`

## 5. Quand appliquer ce runbook

**Immédiatement** dès qu'un commit sur `main` produit un pipeline rouge avec une erreur de build frontend.

## 6. Quand ne PAS appliquer ce runbook

- Si l'erreur est un problème de dépendances npm (package introuvable) — exécuter `npm ci` en local d'abord
- Si le pipeline échoue aux tests unitaires — corriger le code d'abord
- Si l'erreur est un timeout DockerHub — relancer le workflow manuellement
- Si l'erreur est un problème Docker (Docker daemon) — vérifier les runners GitHub

## 7. Étapes à suivre

### Étape 1 : Diagnostiquer

```bash
# Aller dans l'onglet Actions du repo GitHub
# Cliquer sur le run échoué
# Ouvrir les logs de l'étape "Build Docker image"
# Identifier le type d'erreur : TypeScript, module manquant, ou fichier manquant
```

### Étape 2 : Vérifier le build en local

```bash
# Nettoyer et rebuild
rm -rf node_modules dist
npm ci
npm run build

# Si le build passe en local mais pas dans le pipeline :
# Vérifier les différences de version Node (local vs CI)
node --version
```

### Étape 3 : Corriger les erreurs TypeScript

```bash
# Lancer le type-check seul
npx tsc --noEmit

# Corriger les erreurs de type dans les fichiers concernés
# Les erreurs courantes :
# - Type 'X' is not assignable to type 'Y' → corriger le type ou l'appel
# - Property 'X' does not exist on type 'Y' → ajouter la propriété dans l'interface
# - Cannot find module 'X' → vérifier l'import et que le fichier existe
```

### Étape 4 : Vérifier les fichiers manquants

```bash
# Vérifier que tous les fichiers importés existent
ls src/main.tsx
ls src/App.tsx
ls index.html

# Vérifier que index.html référence bien le bon point d'entrée
cat index.html | grep -E 'src=".+\.(ts|tsx|js)"'
# Doit afficher : <script type="module" src="/src/main.tsx"></script>
```

### Étape 5 : Vérifier le Dockerfile

```dockerfile
# Le Dockerfile doit contenir :
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Étape 6 : Vérifier le .dockerignore

```bash
cat .dockerignore
# Doit contenir :
# node_modules
# dist
# coverage
# reports
# .git
# .env
# *.local
```

### Étape 7 : Forcer le rebuild et repousser

```bash
# En local
rm -rf node_modules dist
npm ci
npm run build
git add -A
git commit -m "fix: resolve build errors"
git push
```

### Étape 8 : Vérifier le pipeline

- Aller sur https://github.com/LTOssian/cicd-tasklist-frontend/actions
- Vérifier que le nouveau run passe au vert
- Vérifier que l'image est poussée sur DockerHub

## 8. Post-mortem

Après résolution, mettre à jour ce runbook si la cause était différente de celles listées.

## 9. Liens utiles

- Pipeline CI/CD : https://github.com/LTOssian/cicd-tasklist-frontend/actions
- DockerHub : https://hub.docker.com/r/LTOssian/cicd-tasklist-frontend
- Documentation Vite : https://vite.dev/guide/build
- SonarQube : https://sonarqube.cicd.kits.ext.educentre.fr/dashboard?id=louisan-cicd-tasklist-frontend
