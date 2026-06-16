export * from './index';
import { boot } from './core/init';

if (typeof window !== 'undefined' && !window.AccessFlowConfig?.skipAutoInit) {
  boot(window.AccessFlowConfig);
}
