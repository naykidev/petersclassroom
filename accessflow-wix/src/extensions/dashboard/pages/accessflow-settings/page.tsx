import React, { useCallback, useEffect, useState } from 'react';
import { embeddedScripts } from '@wix/app-management';
import { dashboard } from '@wix/dashboard';
import {
  Badge,
  Box,
  Button,
  Card,
  Cell,
  ColorInput,
  Dropdown,
  FormField,
  Heading,
  Image,
  Layout,
  Page,
  Text,
  ToggleSwitch,
  WixDesignSystemProvider,
} from '@wix/design-system';
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_FEATURES,
  DEFAULT_SETTINGS,
  FEATURE_LABELS,
  POSITION_OPTIONS,
  type AccessFlowSettings,
  type FeatureFlags,
  type ToolbarPosition,
  parametersToSettings,
  settingsToParameters,
} from '../../../../lib/settings';

const ICON_URL = 'https://axoloassist.com/cdn/accessibility.png';

export default function AccessFlowSettingsPage(): React.JSX.Element {
  const [position, setPosition] = useState<ToolbarPosition>(DEFAULT_SETTINGS.position);
  const [accentColor, setAccentColor] = useState<string>(DEFAULT_ACCENT_COLOR);
  const [features, setFeatures] = useState<FeatureFlags>(DEFAULT_FEATURES);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function loadSettings(): Promise<void> {
      try {
        const script = await embeddedScripts.getEmbeddedScript();
        if (!active) {
          return;
        }
        const loaded = parametersToSettings(script.parameters as Record<string, string>);
        setPosition(loaded.position);
        setAccentColor(loaded.accentColor);
        setFeatures(loaded.features);
      } catch (error) {
        console.error('AccessFlow: failed to load settings', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const handleFeatureToggle = useCallback((key: keyof FeatureFlags, checked: boolean) => {
    setFeatures((prev) => ({ ...prev, [key]: checked }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);

    const settings: AccessFlowSettings = {
      position,
      accentColor,
      features,
    };

    try {
      await embeddedScripts.embedScript({
        parameters: settingsToParameters(settings),
      });
      setSaved(true);
      dashboard.showToast({
        message: 'AccessFlow settings saved. Visit your site to see changes.',
        type: 'success',
      });
    } catch (error) {
      console.error('AccessFlow: failed to save settings', error);
      dashboard.showToast({
        message: 'Could not save settings. Try again.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  }, [accentColor, features, position]);

  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <Page>
        <Page.Header
          title="AccessFlow Settings"
          subtitle="Customize the accessibility toolbar for your site visitors"
          actionsBar={
            <Badge skin="success" uppercase={false}>
              <Box direction="horizontal" verticalAlign="middle" gap="6px">
                <Box
                  width="8px"
                  height="8px"
                  borderRadius="50%"
                  backgroundColor="G10"
                />
                Active
              </Box>
            </Badge>
          }
        />
        <Page.Content>
          <Layout>
            <Cell span={8}>
              <Card>
                <Card.Header title="Toolbar Appearance" />
                <Card.Divider />
                <Card.Content>
                  <Box direction="vertical" gap="24px">
                    <FormField label="Button Position">
                      <Dropdown
                        options={POSITION_OPTIONS}
                        selectedId={position}
                        disabled={loading}
                        onSelect={(option) => {
                          if (option?.id) {
                            setPosition(option.id as ToolbarPosition);
                            setSaved(false);
                          }
                        }}
                      />
                    </FormField>
                    <FormField label="Accent Color">
                      <ColorInput
                        value={accentColor}
                        disabled={loading}
                        onConfirm={(color) => {
                          setAccentColor(color as string);
                          setSaved(false);
                        }}
                        onCancel={() => undefined}
                      />
                    </FormField>
                  </Box>
                </Card.Content>
              </Card>

              <Box marginTop="24px">
                <Card>
                  <Card.Header
                    title="Visible Features"
                    subtitle="Uncheck any feature to hide it from your visitors' toolbar"
                  />
                  <Card.Divider />
                  <Card.Content>
                    <Layout cols={12}>
                      {FEATURE_LABELS.map(({ key, label }) => (
                        <Cell key={key} span={6}>
                          <Box
                            direction="horizontal"
                            verticalAlign="middle"
                            gap="12px"
                          >
                            <ToggleSwitch
                              checked={features[key]}
                              disabled={loading}
                              onChange={() =>
                                handleFeatureToggle(key, !features[key])
                              }
                            />
                            <Text>{label}</Text>
                          </Box>
                        </Cell>
                      ))}
                    </Layout>
                  </Card.Content>
                </Card>
              </Box>

              <Box marginTop="24px">
                <Card>
                  <Card.Header title="How to use" />
                  <Card.Divider />
                  <Card.Content>
                    <Box direction="horizontal" gap="24px" verticalAlign="top">
                      <Box width="72px">
                        <Image src={ICON_URL} width="72px" height="72px" />
                      </Box>
                      <Box direction="vertical" gap="12px">
                        <Text>
                          AccessFlow is automatically active on every page of your
                          site. Your visitors see a floating accessibility button in
                          the corner you selected. They click it to open the panel and
                          adjust their reading experience. Settings are saved
                          automatically in their browser.
                        </Text>
                        <Text size="small" secondary>
                          After changing settings here, click Save Settings, then
                          refresh your live site to confirm the toolbar position and
                          visible controls.
                        </Text>
                      </Box>
                    </Box>
                  </Card.Content>
                </Card>
              </Box>

              <Box marginTop="24px" direction="horizontal" gap="12px" verticalAlign="middle">
                <Button onClick={() => void handleSave()} disabled={saving || loading}>
                  {saving ? 'Saving…' : 'Save Settings'}
                </Button>
                {saved ? (
                  <Text size="small" skin="success">
                    Settings saved
                  </Text>
                ) : null}
              </Box>
            </Cell>

            <Cell span={4}>
              <Card>
                <Card.Header title="AccessFlow" />
                <Card.Divider />
                <Card.Content>
                  <Box direction="vertical" gap="12px">
                    <Heading size="medium">Free accessibility toolbar</Heading>
                    <Text size="small" secondary>
                      Font, contrast, spacing, and motion controls for every visitor.
                      Built by Axolo Assist.
                    </Text>
                    <Text size="small" secondary>
                      Visitor preferences stay in the browser. AccessFlow does not
                      collect personal data or run third-party tracking.
                    </Text>
                  </Box>
                </Card.Content>
              </Card>
            </Cell>
          </Layout>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
}
