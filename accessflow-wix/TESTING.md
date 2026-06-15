# AccessFlow — Local Testing Guide

## How to test locally

1. Complete setup in [WIX-SETUP.md](./WIX-SETUP.md) (Node 18+, `npm install`, Wix account).

2. Start the dev server:
   ```bash
   cd accessflow-wix
   wix dev
   ```

3. The CLI opens a browser with a **development Wix site**. Sign in if prompted. The app is installed on that site automatically.

4. In the CLI menu, open the **Site** (frontend). You should see the **AccessFlow** floating button in the corner defined by `params.dev.json` (default: bottom-right).

5. Click the button — the panel opens with all accessibility controls.

6. Test each control:
   - **Text size** → page text scales
   - **Dark mode** (Contrast → Dark) → page background goes dark
   - **Reading guide** → yellow bar follows the cursor
   - **Large cursor** → cursor enlarges
   - **Font → Dyslexia-friendly** → OpenDyslexic loads (requires CDN fonts)

7. Refresh the page — visitor settings should persist (`localStorage` key `accessflow-wix-settings-v1`).

8. Open the **Dashboard** from the CLI menu → **Apps → AccessFlow → Settings**.

9. Change **Button Position** → **Save Settings** → refresh the frontend → the button moves.

10. Toggle **Visible Features** off (e.g. Text Size) → save → refresh frontend → that section is hidden.

11. Change **Accent Color** → save → refresh → active buttons and switches use the new color.

## What to verify before release

- [ ] No console errors on the live site
- [ ] CSS loads from `https://axoloassist.com/cdn/accessflow.css`
- [ ] Icon loads from `https://axoloassist.com/cdn/accessibility.png`
- [ ] Panel opens/closes with overlay, Escape, and focus trap
- [ ] Reset shows “✓ All reset” confirmation
- [ ] Dashboard saves without errors (success toast)
- [ ] `wix release` completes successfully

## Common issues

### Toolbar does not appear

- Check the browser console for errors in `embedded.html`.
- Confirm `params.dev.json` values are valid during `wix dev`.
- On a **published** install (not local dev), open the dashboard and click **Save Settings** once to call `embedScript()`.

### Styles do not load

- Verify `https://axoloassist.com/cdn/accessflow.css` is publicly accessible.
- Check for CSP or ad-blocker interference in dev tools → Network.

### Settings do not persist after Save in dashboard

- Confirm **Manage Embedded Scripts** permission is enabled in Dev Center.
- Check dashboard console for `embeddedScripts.embedScript()` errors.
- Run `wix release` — embed API requires a released app version in production.

### Dashboard page is blank

- Run `npm run typecheck` and fix TypeScript errors.
- Ensure `@wix/app-management` and `@wix/design-system` are installed.

### Font picker does nothing

- OpenDyslexic WOFF files must be hosted at `https://axoloassist.com/cdn/fonts/`.

### Dynamic parameters show as literal `{{position}}`

- Parameters only substitute when embedded via the API or `params.dev.json` during dev.
- Ensure parameter names in `embedded.html` match `embedded.json` exactly (`position`, `accentColor`, `featuresJson`).

## Typecheck

```bash
npm run typecheck
```

## Build (optional)

```bash
npm run build
```
