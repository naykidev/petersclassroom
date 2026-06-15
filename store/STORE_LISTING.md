# Store listing copy (Accessibility Surfer)

Paste these into the Chrome Web Store Developer Dashboard.

---

## Package

- **Upload file:** `store/accessibility-surfer-v0.5.0.zip`
- **Manifest version:** 0.5.0

---

## Store listing

### Name

```
Accessibility Surfer
```

### Summary (short description, max 132 characters)

Use the manifest line (already in the zip):

```
Universal dwell clicking on every site, with smart YouTube targeting on top. Plus text-accessibility controls.
```

### Detailed description

```
Browse with less clicking, easier reading, and more control.

Accessibility Surfer is a free Chrome extension from Axol Assist for people who navigate the web differently: mobility limitations, tremors, pain, low vision, dyslexia, ADHD, eye gaze, head tracking, or anyone tired of fighting tiny click targets.

HOVER TO CLICK (DWELL CLICKING)
• Point at links, buttons, and controls. A ring counts down, then clicks for you.
• Separate dwell times for YouTube videos, YouTube player controls, and every other site.
• Toggle on or off anytime from the toolbar popup or with Space.
• On-screen floating toggle on every page.

TEXT ACCESSIBILITY
• Change font, size, line height, letter spacing, and word spacing on any website.
• Dyslexia-friendly and hyperlegible fonts bundled locally. Works offline.
• Settings sync across tabs and are stored only on your device.

READING MODE
• Strip noisy layouts down to the article.
• Focus mode, fatigue compensation, progress tracking, and optional plain-language word hints.
• Alt + R shortcut. Page content never leaves your browser.

PRIVACY
• No analytics, telemetry, or remote servers.
• Settings stay in Chrome local storage on your device.
• Privacy policy: https://axolassist.com/privacy.html

Support: axolassist.business@gmail.com
Website: https://axolassist.com/easepass.html
```

### Category

```
Accessibility
```

### Language

```
English
```

### Homepage URL

```
https://axolassist.com/easepass.html
```

### Support URL (optional)

```
https://axolassist.com/easepass.html#contact
```

Or mailto:

```
mailto:axolassist.business@gmail.com?subject=Accessibility%20Surfer%20support
```

---

## Graphic assets

| Asset | File |
|-------|------|
| Icon 128×128 | `store/promo-icon-128.png` |
| Screenshot 1280×800 | `store/screenshots/01-extension-in-action-1280x800.png` |

Optional: add more screenshots later (reading mode, dwell ring on a real page, text controls).

---

## Privacy practices (dashboard questionnaire)

Use these answers. Wording may vary slightly by form version.

### Single purpose

This extension provides accessibility tools for web browsing: dwell clicking (hover-to-click), on-page text accessibility controls, and reading mode. All features support users with motor, vision, and cognitive access needs.

### Permissions justification

| Permission | Why |
|------------|-----|
| `storage` | Save user settings locally (dwell times, fonts, reading mode preferences). |
| `activeTab` | Apply accessibility settings and dwell behavior on the current tab. |
| `scripting` | Inject accessibility UI and behavior on pages the user visits. |
| `tabs` | Sync toolbar badge state and open reading mode from the popup. |
| `<all_urls>` | Dwell clicking and text controls must work on any site the user browses. |

### Data collection

**Does your extension collect user data?**  
No (or: No user data is collected, transmitted, or sold.)

**What user data do you collect?**  
None transmitted off-device. Settings are stored locally in `chrome.storage.local`.

**Is data sold to third parties?**  
No

**Is data used for purposes unrelated to the extension's core functionality?**  
No

**Is data transferred to third parties?**  
No

### Privacy policy URL

```
https://axolassist.com/privacy.html
```

### Certifications (typical for this extension)

- Does not collect personal information
- Does not use remote analytics or advertising
- All reading mode and page processing happens locally in the browser

---

## Distribution

- **Visibility:** Public (or Unlisted for a soft launch)
- **Regions:** All regions (or limit if you prefer)
- **Pricing:** Free

---

## After publish

Replace `PLACEHOLDER_EXTENSION_ID` in `site-config.js` and `easepass-extension/site-urls.js` with the ID from your live store URL.

Example store URL:

```
https://chrome.google.com/webstore/detail/accessibility-surfer/abcdefghijklmnopqrstuvwxyz123456
```

The ID is the last path segment.
