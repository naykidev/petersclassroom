import { useEffect } from 'react';
import { destroy, init } from './core/init';
import type { AccessFlowConfig } from './core/types';

export type { AccessFlowConfig, AccessFlowPosition, AccessFlowFeatures } from './core/types';
export { init, destroy, VERSION } from './core/init';

export function AccessFlow(props: AccessFlowConfig = {}): null {
  useEffect(() => {
    init(props);
    return () => destroy();
    // Mount once with initial props; remounting re-inits via destroy cleanup.
  }, []);

  return null;
}
