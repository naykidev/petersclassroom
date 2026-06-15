import { app } from '@wix/astro/builders';
import accessflowEmbed from './extensions/site/embedded-scripts/accessflow-embed/accessflow-embed.extension.ts';
import accessflowSettings from './extensions/dashboard/pages/accessflow-settings/page.extension.ts';

export default app().use(accessflowEmbed).use(accessflowSettings);
