import { LyricLine, LyricsFormat, ParsedLyrics } from './lyrics.types';

const LRC_TIMESTAMP = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;
const LRC_METADATA = /^\[(ti|ar|al|by|offset|re|ve|length):.*\]$/i;
const SRT_TIMESTAMP =
  /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/;

/**
 * LRC fractions are hundredths by convention, but some editors emit
 * tenths or milliseconds. Infer from the digit count.
 */
function fractionToSeconds(fraction: string | undefined): number {
  if (!fraction) {
    return 0;
  }
  if (fraction.length === 1) {
    return Number(fraction) / 10;
  }
  if (fraction.length === 2) {
    return Number(fraction) / 100;
  }
  return Number(fraction) / 1000;
}

function compareLines(a: LyricLine, b: LyricLine): number {
  return (a.time ?? 0) - (b.time ?? 0);
}

function toTimedLyrics(lines: LyricLine[]): ParsedLyrics {
  lines.sort(compareLines);
  return { timed: true, lines };
}

export function parseLrc(raw: string): ParsedLyrics {
  const lines: LyricLine[] = [];

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || LRC_METADATA.test(line)) {
      continue;
    }

    const times: number[] = [];
    let lastMatchEnd = 0;
    let match: RegExpExecArray | null;
    LRC_TIMESTAMP.lastIndex = 0;

    while ((match = LRC_TIMESTAMP.exec(line)) !== null) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      times.push(minutes * 60 + seconds + fractionToSeconds(match[3]));
      lastMatchEnd = LRC_TIMESTAMP.lastIndex;
    }

    if (times.length === 0) {
      continue;
    }

    const text = line.slice(lastMatchEnd).trim();
    for (const time of times) {
      lines.push({ time, text });
    }
  }

  return toTimedLyrics(lines);
}

export function parseSrt(raw: string): ParsedLyrics {
  const lines: LyricLine[] = [];
  const blocks = raw.replace(/\r/g, '').split(/\n{2,}/);

  for (const block of blocks) {
    const blockLines = block.split('\n').filter((line) => line.trim() !== '');
    if (blockLines.length === 0) {
      continue;
    }

    const timestampIndex = blockLines.findIndex((line) => SRT_TIMESTAMP.test(line));
    if (timestampIndex === -1) {
      continue;
    }

    const match = SRT_TIMESTAMP.exec(blockLines[timestampIndex]);
    if (!match) {
      continue;
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3]);
    const time = hours * 3600 + minutes * 60 + seconds + fractionToSeconds(match[4]);
    const text = blockLines
      .slice(timestampIndex + 1)
      .join(' ')
      .trim();

    lines.push({ time, text });
  }

  return toTimedLyrics(lines);
}

export function parsePlainText(raw: string): ParsedLyrics {
  const lines: LyricLine[] = raw
    .replace(/\r/g, '')
    .split('\n')
    .map((text) => ({ time: null, text: text.trimEnd() }));

  while (lines.length > 0 && lines[0].text.trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].text.trim() === '') {
    lines.pop();
  }

  return { timed: false, lines };
}

export function parseLyrics(raw: string, format: LyricsFormat): ParsedLyrics {
  switch (format) {
    case 'lrc':
      return parseLrc(raw);
    case 'srt':
      return parseSrt(raw);
    default:
      return parsePlainText(raw);
  }
}
