# AccessFlow Wix App — Setup Guide

Follow these steps **before** the app will run on a Wix development site. The `accessflow-wix/` folder in this repo contains the full app source; you still need to register it with your Wix account using the CLI.

## Step 1 — Prerequisites

- **Node.js 18+** — check with:
  ```bash
  node --version
  ```
- A free **Wix Studio / Custom Apps** account: [manage.wix.com/account/custom-apps](https://manage.wix.com/account/custom-apps)
- CDN assets hosted at `https://axoloassist.com/cdn/` (`accessflow.css`, `accessflow.js`, `accessibility.png`, fonts). Local copies live in the parent repo’s `cdn/` folder.

## Step 2 — Install the Wix CLI globally

```bash
npm install -g @wix/cli
```

Verify:

```bash
wix --version
```

## Step 3 — Create or link the app project

### Option A — Start from this repo (recommended)

If you already have the `accessflow-wix/` source:

```bash
cd accessflow-wix
npm install
```

Then link to a new Wix app (the CLI will register the app and update `wix.config.json` with your real `appId`):

```bash
wix dev
```

On first run, sign in and choose or create a development site.

### Option B — Scaffold a fresh project, then copy files

```bash
npm create @wix/app@latest
```

When prompted:

| Prompt | Value |
|--------|-------|
| Project name | `accessflow-wix` |
| Template | Blank app |

Then replace the generated `src/` extensions with the files from this repo and run `npm install`.

Alternative (newer CLI):

```bash
npm create @wix/new@latest -- app --app-name "AccessFlow" --template blank
```

## Step 4 — Add extensions (only if scaffolding from scratch)

If you did **not** copy this repo’s extension files:

```bash
cd accessflow-wix
wix app generate extension
```

Select **Embedded Script**, name it `accessflow-embed`.

```bash
wix app generate extension
```

Select **Dashboard Page**, name it `AccessFlow Settings`.

Replace the generated files with the versions in this repo.

## Step 5 — Install dependencies

```bash
cd accessflow-wix
npm install
```

## Step 6 — Enable embedded script permission

In the [Wix Dev Center](https://dev.wix.com/), open your app → **Permissions** and enable:

- **Manage Embedded Scripts** (`SCOPE.DC-APPS.MANAGE-EMBEDDED-SCRIPTS`)

Without this scope, the dashboard cannot call `embedScript()`.

## Step 7 — Start local development

```bash
wix dev
```

The CLI opens a browser with a Wix development site. The app installs automatically. Choose **Site** to preview the toolbar or **Dashboard** to open AccessFlow Settings.

Local embedded-script parameters come from:

`src/extensions/site/embedded-scripts/accessflow-embed/params.dev.json`

## Step 8 — Activate the toolbar on a live install

Embedded scripts are **defined** at install time but must be **embedded** via the API:

1. Open **Apps → AccessFlow → Settings** in the site dashboard.
2. Click **Save Settings** once (this calls `embedScript()` with position, accent color, and feature flags).

After the first save, visitors see the floating AccessFlow button on every page.

## Step 9 — Publish for review

```bash
wix release
```

Then in the Wix App Dashboard:

1. Complete the App Market listing (see `store-assets/listing.md`).
2. Upload screenshots (see `store-assets/screenshots.md`).
3. Submit for review.

## Project layout

```
accessflow-wix/
├── src/
│   ├── extensions.ts
│   ├── lib/settings.ts
│   └── extensions/
│       ├── site/embedded-scripts/accessflow-embed/
│       │   ├── embedded.html          ← toolbar injected on every page
│       │   ├── embedded.json          ← dynamic parameters
│       │   ├── params.dev.json        ← local dev values
│       │   └── accessflow-embed.extension.ts
│       └── dashboard/pages/accessflow-settings/
│           ├── page.tsx               ← settings UI
│           └── page.extension.ts
├── wix.config.json
├── package.json
└── astro.config.mjs
```

## App listing metadata

| Field | Value |
|-------|-------|
| App name | AccessFlow by Axolo Assist |
| Short description | Free accessibility toolbar for every visitor. Font, contrast, spacing, and motion controls. One click to install, zero configuration. |
| Category | Accessibility |

Full listing copy: `store-assets/listing.md`
