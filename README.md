# Robolution 000 Website

Static multilingual presentation site for `Robolution 000`.

Open `index.html` directly in a browser, or serve this folder with:

```bash
python3 -m http.server 8080
```

The site uses local assets copied from `Images/Curated/` and does not require external dependencies.

## End-to-end tests

Install the test dependency and browser once:

```bash
npm install
npx playwright install chromium
```

Run the complete desktop and mobile suite with:

```bash
npm run test:e2e
```

The same suite runs automatically on every push to `main` and on pull requests through GitHub Actions.

## GitHub Pages

This folder is the source of the standalone `robolution` project site.

- Repository: `onchainfinity/robolution`
- GitHub Pages URL: `https://onchainfinity.github.io/robolution/`
- Final URL after the main Onchainfinity site moves to GitHub Pages: `https://onchainfinity.art/robolution/`

The project repository must not contain a `CNAME` file. The custom domain belongs to the
account-level Onchainfinity site; GitHub then exposes this project site below `/robolution`.
