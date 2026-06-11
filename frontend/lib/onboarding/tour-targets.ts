/** Stable `data-tour` value for a portal nav href. */
export function navTourId(href: string): string {
  return `nav-${href.replace(/^\/+|\/$/g, "").replace(/\//g, "-")}`;
}

export function navTourSelector(href: string): string {
  return `[data-tour="${navTourId(href)}"]`;
}
