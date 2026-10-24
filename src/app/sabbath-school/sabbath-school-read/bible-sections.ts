const VERSE_HEADING_START = /<h2\b/i;
const BEFORE_VERSE_HEADING = /(?=<h2\b)/i;

/** Wraps each verse heading with its verses so sticky headings stay in their section. */
export function wrapBibleSections(html: string): string {
  if (!VERSE_HEADING_START.test(html)) {
    return html;
  }

  return html
    .split(BEFORE_VERSE_HEADING)
    .filter((section) => section.trim().length > 0)
    .map((section) => `<section>${section.trim()}</section>`)
    .join('');
}
