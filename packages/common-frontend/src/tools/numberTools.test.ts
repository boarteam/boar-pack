import { describe, expect, it } from 'vitest';
import { dropTrailZeroes } from './numberTools';

describe('dropTrailZeroes', () => {
  it('strips trailing zeroes after the decimal point', () => {
    expect(dropTrailZeroes('1.2300')).toBe('1.23');
    expect(dropTrailZeroes('0.500')).toBe('0.5');
  });

  it('strips a dangling decimal point entirely', () => {
    expect(dropTrailZeroes('42.000')).toBe('42');
    expect(dropTrailZeroes('42.')).toBe('42');
  });

  it('leaves integers without a decimal point untouched', () => {
    expect(dropTrailZeroes('100')).toBe('100');
    expect(dropTrailZeroes('0')).toBe('0');
  });

  it('passes through undefined and non-decimal strings', () => {
    expect(dropTrailZeroes(undefined)).toBeUndefined();
    expect(dropTrailZeroes('abc')).toBe('abc');
  });
});
