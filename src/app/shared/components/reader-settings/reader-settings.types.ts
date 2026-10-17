export type ReaderTheme = 'light' | 'sepia' | 'dark';

/** The five available font-size steps. */
export type ReaderSize = 1 | 2 | 3 | 4 | 5;

export interface ReaderThemeOption {
  readonly value: ReaderTheme;
  readonly label: string;
}

export const READER_THEMES: readonly ReaderThemeOption[] = [
  { value: 'light', label: 'Светла' },
  { value: 'sepia', label: 'Сепия' },
  { value: 'dark', label: 'Тъмна' },
];

export const MIN_READER_SIZE: ReaderSize = 1;
export const MAX_READER_SIZE: ReaderSize = 5;
export const DEFAULT_READER_SIZE: ReaderSize = 3;
export const DEFAULT_READER_THEME: ReaderTheme = 'light';

export interface ReaderTypography {
  fontSize: string;
  lineHeight: string;
}

/**
 * Single source of truth for the five reader font-size steps, shared by
 * every reader (songbook lyrics and Sabbath School article text).
 */
export const READER_TYPOGRAPHY: Record<ReaderSize, ReaderTypography> = {
  1: { fontSize: '0.8rem', lineHeight: '1.2' },
  2: { fontSize: '1rem', lineHeight: '1.4' },
  3: { fontSize: '1.2rem', lineHeight: '1.5' },
  4: { fontSize: '1.4rem', lineHeight: '1.6' },
  5: { fontSize: '1.6rem', lineHeight: '1.7' },
};

export function isReaderTheme(value: string | null): value is ReaderTheme {
  return READER_THEMES.some((theme) => theme.value === value);
}

/** Keeps an arbitrary numeric size inside the supported 1-5 range. */
export function clampReaderSize(size: number): ReaderSize {
  if (size <= MIN_READER_SIZE) {
    return MIN_READER_SIZE;
  }
  if (size >= MAX_READER_SIZE) {
    return MAX_READER_SIZE;
  }

  return Math.round(size) as ReaderSize;
}
