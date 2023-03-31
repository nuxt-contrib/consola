import BrowserReporter from "./reporters/browser";
import { createConsola as _createConsola } from "./consola";
import type { ConsolaOptions } from "./types";

export * from "./index.shared";

export function createConsola(options: Partial<ConsolaOptions> = {}) {
  const consola = _createConsola({
    reporters: options.reporters || [new BrowserReporter({})],
    prompt(message, options = {}) {
      if (options.type === "confirm") {
        return Promise.resolve(confirm(message) as any);
      }
      return Promise.resolve(prompt(message));
    },
    ...options,
  });
  return consola;
}

export const consola = ((globalThis as any).consola =
  (globalThis as any).consola || createConsola());

export default consola;
