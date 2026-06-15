export type FeatureFlags = {
  textSize: boolean;
  lineSpacing: boolean;
  letterSpacing: boolean;
  wordSpacing: boolean;
  font: boolean;
  textAlign: boolean;
  contrast: boolean;
  colorFilter: boolean;
  linkHighlight: boolean;
  readableWidth: boolean;
  underlineLinks: boolean;
  enhancedFocus: boolean;
  highlightHeadings: boolean;
  readingGuide: boolean;
  reduceMotion: boolean;
  pauseAnimations: boolean;
  bigCursor: boolean;
  keyboardNav: boolean;
};

export type ToolbarPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

export type AccessFlowSettings = {
  position: ToolbarPosition;
  accentColor: string;
  features: FeatureFlags;
};

export const DEFAULT_ACCENT_COLOR = '#B03060';

export const DEFAULT_FEATURES: FeatureFlags = {
  textSize: true,
  lineSpacing: true,
  letterSpacing: true,
  wordSpacing: true,
  font: true,
  textAlign: true,
  contrast: true,
  colorFilter: true,
  linkHighlight: true,
  readableWidth: true,
  underlineLinks: true,
  enhancedFocus: true,
  highlightHeadings: true,
  readingGuide: true,
  reduceMotion: true,
  pauseAnimations: true,
  bigCursor: true,
  keyboardNav: true,
};

export const DEFAULT_SETTINGS: AccessFlowSettings = {
  position: 'bottom-right',
  accentColor: DEFAULT_ACCENT_COLOR,
  features: DEFAULT_FEATURES,
};

export const POSITION_OPTIONS: Array<{ id: ToolbarPosition; value: string }> = [
  { id: 'bottom-right', value: 'Bottom Right' },
  { id: 'bottom-left', value: 'Bottom Left' },
  { id: 'top-right', value: 'Top Right' },
  { id: 'top-left', value: 'Top Left' },
];

export const FEATURE_LABELS: Array<{ key: keyof FeatureFlags; label: string }> = [
  { key: 'textSize', label: 'Text Size' },
  { key: 'lineSpacing', label: 'Line Spacing' },
  { key: 'letterSpacing', label: 'Letter Spacing' },
  { key: 'wordSpacing', label: 'Word Spacing' },
  { key: 'font', label: 'Font Picker' },
  { key: 'textAlign', label: 'Text Alignment' },
  { key: 'contrast', label: 'Contrast Modes' },
  { key: 'colorFilter', label: 'Color Filter' },
  { key: 'linkHighlight', label: 'Link Highlight' },
  { key: 'readableWidth', label: 'Readable Width' },
  { key: 'underlineLinks', label: 'Underline Links' },
  { key: 'enhancedFocus', label: 'Enhanced Focus' },
  { key: 'highlightHeadings', label: 'Highlight Headings' },
  { key: 'readingGuide', label: 'Reading Guide' },
  { key: 'reduceMotion', label: 'Reduce Motion' },
  { key: 'pauseAnimations', label: 'Pause Animations' },
  { key: 'bigCursor', label: 'Large Cursor' },
  { key: 'keyboardNav', label: 'Keyboard Nav Helper' },
];

export function parseFeaturesJson(raw: string | undefined): FeatureFlags {
  if (!raw) {
    return { ...DEFAULT_FEATURES };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<FeatureFlags>;
    return { ...DEFAULT_FEATURES, ...parsed };
  } catch {
    return { ...DEFAULT_FEATURES };
  }
}

export function settingsToParameters(settings: AccessFlowSettings): Record<string, string> {
  return {
    position: settings.position,
    accentColor: settings.accentColor,
    featuresJson: JSON.stringify(settings.features),
  };
}

export function parametersToSettings(
  params: Record<string, string | undefined> | undefined
): AccessFlowSettings {
  const position = params?.position as ToolbarPosition | undefined;
  const validPositions: ToolbarPosition[] = [
    'bottom-right',
    'bottom-left',
    'top-right',
    'top-left',
  ];

  return {
    position:
      position && validPositions.includes(position) ? position : DEFAULT_SETTINGS.position,
    accentColor: params?.accentColor || DEFAULT_ACCENT_COLOR,
    features: parseFeaturesJson(params?.featuresJson),
  };
}
