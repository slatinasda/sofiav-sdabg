import { clampReaderSize, isReaderTheme } from './reader-settings.types';

describe('clampReaderSize', () => {
  it('clamps values below the minimum size', () => {
    expect(clampReaderSize(0)).toBe(1);
    expect(clampReaderSize(-3)).toBe(1);
  });

  it('clamps values above the maximum size', () => {
    expect(clampReaderSize(6)).toBe(5);
    expect(clampReaderSize(100)).toBe(5);
  });

  it('keeps values within the supported range', () => {
    expect(clampReaderSize(1)).toBe(1);
    expect(clampReaderSize(3)).toBe(3);
    expect(clampReaderSize(5)).toBe(5);
  });

  it('rounds fractional values to the nearest size', () => {
    expect(clampReaderSize(2.4)).toBe(2);
    expect(clampReaderSize(2.6)).toBe(3);
  });
});

describe('isReaderTheme', () => {
  it('accepts every supported theme', () => {
    expect(isReaderTheme('light')).toBe(true);
    expect(isReaderTheme('sepia')).toBe(true);
    expect(isReaderTheme('dark')).toBe(true);
  });

  it('rejects unknown or missing values', () => {
    expect(isReaderTheme('system')).toBe(false);
    expect(isReaderTheme('')).toBe(false);
    expect(isReaderTheme(null)).toBe(false);
  });
});
