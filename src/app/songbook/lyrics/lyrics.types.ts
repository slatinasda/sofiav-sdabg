export type LyricsFormat = 'lrc' | 'srt' | 'text';

export interface LyricsEntry {
  title: string;
  audio: string;
  lyrics: string;
  format: LyricsFormat;
}

export type LyricsManifest = Record<string, LyricsEntry>;

export interface LyricLine {
  time: number | null;
  text: string;
}

export interface ParsedLyrics {
  timed: boolean;
  lines: LyricLine[];
}
