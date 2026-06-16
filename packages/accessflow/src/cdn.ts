import { accessFlowAPI, boot } from './core/init';

if (typeof window !== 'undefined') {
  window.AccessFlow = accessFlowAPI;
  if (!window.AccessFlowConfig?.skipAutoInit) {
    boot(window.AccessFlowConfig);
  }
}

export { accessFlowAPI as AccessFlow };
