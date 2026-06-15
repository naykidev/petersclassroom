import { extensions } from '@wix/astro/builders';

export default extensions.embeddedScript({
  id: 'f4a8c2e1-9b3d-4f6a-8c1e-2d5a9b7e4f01',
  name: 'AccessFlow Embed',
  placement: 'BODY_END',
  scriptType: 'FUNCTIONAL',
  source: './embedded.html',
});
