import { parseLrc, parseLyrics, parsePlainText, parseSrt } from './lyrics-parser';

describe('parseLrc', () => {
  it('parses timestamps into seconds and sorts by time', () => {
    const raw = '[00:12.00]Second\n[00:05.50]First';
    const result = parseLrc(raw);

    expect(result.timed).toBe(true);
    expect(result.lines).toEqual([
      { time: 5.5, text: 'First' },
      { time: 12, text: 'Second' },
    ]);
  });

  it('supports multiple timestamps on one line', () => {
    const result = parseLrc('[00:01.00][00:03.00]Chorus');

    expect(result.lines).toEqual([
      { time: 1, text: 'Chorus' },
      { time: 3, text: 'Chorus' },
    ]);
  });

  it('ignores metadata tags and untimed lines', () => {
    const raw = '[ti:Title]\n[ar:Artist]\nrandom line\n[00:02.00]Hello';
    const result = parseLrc(raw);

    expect(result.lines).toEqual([{ time: 2, text: 'Hello' }]);
  });

  it('infers millisecond fractions from three digits', () => {
    const result = parseLrc('[01:00.250]Line');

    expect(result.lines[0].time).toBeCloseTo(60.25);
  });

  it('keeps empty timed lines as stanza breaks', () => {
    const result = parseLrc('[00:01.00]A\n[00:02.00]\n[00:03.00]B');

    expect(result.lines).toEqual([
      { time: 1, text: 'A' },
      { time: 2, text: '' },
      { time: 3, text: 'B' },
    ]);
  });
});

describe('parseSrt', () => {
  it('parses blocks with sequence numbers', () => {
    const raw = [
      '1',
      '00:00:01,000 --> 00:00:04,000',
      'Hello',
      'world',
      '',
      '2',
      '00:00:05,500 --> 00:00:07,000',
      'Bye',
    ].join('\n');

    const result = parseSrt(raw);

    expect(result.timed).toBe(true);
    expect(result.lines).toEqual([
      { time: 1, text: 'Hello world' },
      { time: 5.5, text: 'Bye' },
    ]);
  });
});

describe('parsePlainText', () => {
  it('marks lyrics as untimed and trims outer blank lines', () => {
    const result = parsePlainText('\nLine one\n\nLine two\n\n');

    expect(result.timed).toBe(false);
    expect(result.lines).toEqual([
      { time: null, text: 'Line one' },
      { time: null, text: '' },
      { time: null, text: 'Line two' },
    ]);
  });
});

describe('parseLyrics', () => {
  it('dispatches on the manifest format', () => {
    expect(parseLyrics('[00:01.00]A', 'lrc').timed).toBe(true);
    expect(parseLyrics('A', 'text').timed).toBe(false);
  });
});
