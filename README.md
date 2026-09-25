# Neighbourhood Notes

A reader-first community blog for discovering local stories, publishing notes, and
leaving useful comments. The app ships with realistic seeded content and saves
visitor-authored posts and comments to browser local storage, so it works without
an external service.

## Local development

Requires Node.js 22.12.x LTS, 24.x LTS, or newer even-numbered majors supported
by the locked Vitest toolchain. The bundled GitHub Pages workflow runs on Node.js 24.

```sh
npm install
npm run dev
```

```sh
npm test
npm run build
```

## GitHub Pages

The production build is configured for the repository URL below because GitHub
Pages publishes from the unchanged `community-blog` repository path:
`https://madmaxxbitch.github.io/community-blog/`.

`.github/workflows/deploy-pages.yml` deploys on pushes to `main` and can also be
run manually from the Actions tab. Before the first deployment, open
**Settings → Pages** in the GitHub repository and set **Source** to
**GitHub Actions**. After the workflow succeeds, the app is available at the URL
above.
