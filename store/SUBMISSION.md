# Chrome Web Store submission pack

Everything you need to publish **Accessibility Surfer v0.5.0**.

## Files in this folder

| File | Use |
|------|-----|
| `accessibility-surfer-v0.5.0.zip` | Upload in Dev Console → **New Item** |
| `promo-icon-128.png` | Store listing icon (128×128) |
| `screenshots/01-extension-in-action-1280x800.png` | Required screenshot (1280×800) |
| `STORE_LISTING.md` | Copy-paste text for the listing form |
| `store-screenshot.html` | Optional template if you want to regenerate marketing shots |

## Submit (step by step)

1. Open [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with the Google account that paid the one-time $5 developer fee
3. Click **New item**
4. Upload `accessibility-surfer-v0.5.0.zip`
5. Open `STORE_LISTING.md` and paste the listing fields
6. Upload `promo-icon-128.png` and the screenshot from `screenshots/`
7. Complete **Privacy** (answers in `STORE_LISTING.md`)
8. Click **Submit for review**

Review usually takes a few days. Google may email you if they need changes.

## After approval

1. Copy the extension ID from the store URL  
   `https://chrome.google.com/webstore/detail/accessibility-surfer/YOUR_ID_HERE`
2. Replace `PLACEHOLDER_EXTENSION_ID` in:
   - `site-config.js`
   - `easepass-extension/site-urls.js`
3. Commit, push, and redeploy the site so **Add to Chrome** buttons go to the live listing

## Rebuild the zip (after code changes)

From the project root:

```bash
cd easepass-extension
zip -r ../store/accessibility-surfer-v0.5.0.zip . -x "*.DS_Store" -x "icons/*.svg"
```

Bump `version` in `manifest.json` before each new upload.

## Optional: better screenshots

Google accepts up to 5 screenshots. Good follow-ups to capture manually:

- Dwell ring on a real link or YouTube thumbnail
- Reading mode on a long article
- Text accessibility controls applied to a news page

Use **1280×800** or **640×400** PNG or JPEG.
