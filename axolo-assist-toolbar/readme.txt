=== Axolo Assist Toolbar ===
Contributors: axoloassist
Tags: accessibility, toolbar, contrast, dyslexia, font size, reading
Requires at least: 5.0
Tested up to: 6.5
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Floating accessibility toolbar for WordPress with text, contrast, motion, and reading controls.

== Description ==

Axolo Assist Toolbar adds a fixed accessibility button to every public page on your WordPress site. Visitors can open a side panel and adjust how the page looks and behaves without leaving the site.

**Features**

* Text size: A, A+, A++, A+++
* Line spacing: Normal, Wide, Wider
* Letter spacing: Normal, Wide, Wider
* Font picker: Default and dyslexia-friendly OpenDyslexic
* Contrast modes: Normal, Dark, High
* Color filters: None, Gray, Muted, Invert
* Underline all links
* Enhanced focus indicators
* Highlight headings
* Reading guide bar that follows the cursor
* Reduce motion and animations
* Pause all animations
* Large cursor
* Reset all settings
* Settings persist in the browser via localStorage

Site owners can customize the accent color and show or hide individual controls under Settings, Axolo Assist Toolbar.

== Installation ==

1. Upload the axolo-assist-toolbar folder to the /wp-content/plugins/ directory, or upload the plugin zip via Plugins, Add New, Upload Plugin.
2. Activate the plugin through the Plugins menu in WordPress.
3. Done. The toolbar appears on the front end automatically. No configuration is required.

Optional: open Settings, Axolo Assist Toolbar to change the accent color or hide features you do not need.

== Frequently Asked Questions ==

= Does this work with any theme? =

Yes. Toolbar styles are scoped to the plugin markup and accessibility modes apply to the page through standard HTML data attributes.

= Where are visitor settings stored? =

In the browser localStorage under the key pc-a11y-settings-v1. Nothing is sent to your server.

= Can I hide some controls? =

Yes. Use the settings page checkboxes to toggle each feature group on or off.

== Changelog ==

= 1.0.0 =
* Initial release.
