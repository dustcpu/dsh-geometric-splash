/**
 * Host half of dsh-splash.
 *
 * The splash is browser-only. This row exists so the Loader has an entry for the
 * package: dsh-client-modules scans enabled entries for `dsh.client` and turns
 * the declarations into browser bundles. There is intentionally no Host service,
 * no command, and no config.
 */

/** Stable Cordis plugin name. */
export const name = 'dsh-splash'

/** No Host services are required. */
export const inject = []

/** No Host behaviour; the client half owns everything. */
export function apply() {}
