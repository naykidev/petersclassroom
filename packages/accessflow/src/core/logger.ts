const PREFIX = '[AccessFlow]';

export function warn(message: string): void {
  if (typeof console !== 'undefined') {
    console.warn(`${PREFIX} ${message}`);
  }
}

export function error(message: string, detail?: unknown): void {
  if (typeof console !== 'undefined') {
    console.error(`${PREFIX} ${message}`, detail ?? '');
  }
}
