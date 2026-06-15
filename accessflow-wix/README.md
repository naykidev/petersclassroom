# AccessFlow — Wix App

**AccessFlow by Axolo Assist** injects a free accessibility toolbar into every page of a Wix site when a site owner installs the app from the Wix App Market.

## What it does

- **Embedded Script** extension loads the AccessFlow toolbar on all site pages.
- **Dashboard Page** lets site owners set button position, accent color, and which features appear.
- Visitor preferences save in the browser (`localStorage`); no server-side tracking.

## Quick start

```bash
cd accessflow-wix
npm install
wix dev
```

See [WIX-SETUP.md](./WIX-SETUP.md) for full setup and [TESTING.md](./TESTING.md) for the test checklist.

## CDN assets

The embedded script loads styles and fonts from:

- `https://axoloassist.com/cdn/accessflow.css`
- `https://axoloassist.com/cdn/accessibility.png`
- `https://axoloassist.com/cdn/fonts/`

Source copies are in the parent repo’s `cdn/` directory.

## Tech stack

- Wix unified CLI (Astro + TypeScript + React)
- `@wix/design-system` dashboard UI
- `@wix/app-management` embedded scripts API
- Vanilla JS toolbar inlined in `embedded.html`

## Release

```bash
wix release
```

Listing copy: [store-assets/listing.md](./store-assets/listing.md)
