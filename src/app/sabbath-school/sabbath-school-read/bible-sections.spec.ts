import { wrapBibleSections } from './bible-sections';

describe('wrapBibleSections', () => {
  it('returns HTML without headings unchanged', () => {
    const html = '<p>Text without headings</p>';

    expect(wrapBibleSections(html)).toBe(html);
  });

  it('wraps each heading and its verses in a section', () => {
    const html = '<h2>Първи стих</h2><p>Текст 1</p><h2>Втори стих</h2><p>Текст 2</p>';

    expect(wrapBibleSections(html)).toBe(
      '<section><h2>Първи стих</h2><p>Текст 1</p></section>' +
        '<section><h2>Втори стих</h2><p>Текст 2</p></section>',
    );
  });

  it('keeps content before the first heading in its own section', () => {
    const html = '<p>Въведение</p><h2>Стих</h2><p>Текст</p>';

    expect(wrapBibleSections(html)).toBe(
      '<section><p>Въведение</p></section>' + '<section><h2>Стих</h2><p>Текст</p></section>',
    );
  });

  it('does not create an empty section for whitespace before the first heading', () => {
    const html = '  \n<h2>Стих</h2><p>Текст</p>';

    expect(wrapBibleSections(html)).toBe('<section><h2>Стих</h2><p>Текст</p></section>');
  });

  it('matches headings case-insensitively', () => {
    const html = '<H2>Стих</H2><p>Текст</p>';

    expect(wrapBibleSections(html)).toBe('<section><H2>Стих</H2><p>Текст</p></section>');
  });
});
