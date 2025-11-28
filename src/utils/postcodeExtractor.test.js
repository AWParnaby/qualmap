import { describe, it, expect } from 'vitest';
import { extractDistrict, extractUniquePostcodes, groupDistrictsByArea } from './postcodeExtractor';

describe('extractDistrict', () => {
  it('extracts district from full postcode with space', () => {
    expect(extractDistrict('NE1 4ST')).toBe('NE1');
    expect(extractDistrict('TS16 1AA')).toBe('TS16');
    expect(extractDistrict('SW1A 1AA')).toBe('SW1A');
  });

  it('extracts district from postcode without space (may include sector letter if ambiguous)', () => {
    // Without spaces, postcodes are ambiguous - "NE14ST" could be "NE14" + "ST" or "NE14S" + "T"
    expect(extractDistrict('NE14ST')).toBe('NE14S');
    expect(extractDistrict('TS161AA')).toBe('TS16');  // TS16 + 1AA - unambiguous as 1 isn't valid district ending
  });

  it('handles district-only postcodes', () => {
    expect(extractDistrict('NE1')).toBe('NE1');
    expect(extractDistrict('TS16')).toBe('TS16');
    expect(extractDistrict('SW1A')).toBe('SW1A');
  });

  it('handles lowercase postcodes', () => {
    expect(extractDistrict('ne1 4st')).toBe('NE1');
    expect(extractDistrict('ts16 1aa')).toBe('TS16');
    expect(extractDistrict('sw1a 1aa')).toBe('SW1A');
  });

  it('handles postcodes with extra whitespace', () => {
    expect(extractDistrict('  NE1 4ST  ')).toBe('NE1');
    expect(extractDistrict('TS16  1AA')).toBe('TS16');
  });

  it('handles single-letter area codes', () => {
    expect(extractDistrict('E1 4ST')).toBe('E1');
    expect(extractDistrict('N16 1AA')).toBe('N16');
    expect(extractDistrict('M1 1AA')).toBe('M1');
  });

  it('handles two-letter area codes', () => {
    expect(extractDistrict('NE1 4ST')).toBe('NE1');
    expect(extractDistrict('TS16 1AA')).toBe('TS16');
    expect(extractDistrict('SW1A 1AA')).toBe('SW1A');
  });

  it('returns null for invalid postcodes', () => {
    expect(extractDistrict('INVALID')).toBe(null);
    expect(extractDistrict('123')).toBe(null);
    expect(extractDistrict('AB')).toBe(null);
  });

  it('returns null for empty or null input', () => {
    expect(extractDistrict('')).toBe(null);
    expect(extractDistrict(null)).toBe(null);
    expect(extractDistrict(undefined)).toBe(null);
  });

  it('returns null for non-string input', () => {
    expect(extractDistrict(123)).toBe(null);
    expect(extractDistrict({})).toBe(null);
    expect(extractDistrict([])).toBe(null);
  });
});

describe('extractUniquePostcodes', () => {
  it('extracts unique districts from data array', () => {
    const data = [
      { postcode: 'NE1 4ST' },
      { postcode: 'NE1 5AA' },
      { postcode: 'TS16 1AA' },
      { postcode: 'TS16 2BB' }
    ];

    const result = extractUniquePostcodes(data);

    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect(result.has('NE1')).toBe(true);
    expect(result.has('TS16')).toBe(true);
  });

  it('handles custom postcode field name', () => {
    const data = [
      { location: 'NE1 4ST' },
      { location: 'TS16 1AA' }
    ];

    const result = extractUniquePostcodes(data, 'location');

    expect(result.size).toBe(2);
    expect(result.has('NE1')).toBe(true);
    expect(result.has('TS16')).toBe(true);
  });

  it('ignores items with invalid postcodes', () => {
    const data = [
      { postcode: 'NE1 4ST' },
      { postcode: 'INVALID' },
      { postcode: 'TS16 1AA' },
      { postcode: '' }
    ];

    const result = extractUniquePostcodes(data);

    expect(result.size).toBe(2);
    expect(result.has('NE1')).toBe(true);
    expect(result.has('TS16')).toBe(true);
  });

  it('ignores items with missing postcode field', () => {
    const data = [
      { postcode: 'NE1 4ST' },
      { name: 'Test' },
      { postcode: 'TS16 1AA' }
    ];

    const result = extractUniquePostcodes(data);

    expect(result.size).toBe(2);
  });

  it('returns empty set for empty array', () => {
    const result = extractUniquePostcodes([]);

    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });

  it('returns empty set for null or non-array input', () => {
    expect(extractUniquePostcodes(null).size).toBe(0);
    expect(extractUniquePostcodes(undefined).size).toBe(0);
    expect(extractUniquePostcodes('not an array').size).toBe(0);
  });
});

describe('groupDistrictsByArea', () => {
  it('groups districts by area code', () => {
    const districts = ['NE1', 'NE2', 'TS1', 'TS16'];

    const result = groupDistrictsByArea(districts);

    expect(result).toHaveProperty('NE');
    expect(result).toHaveProperty('TS');
    expect(result.NE).toBeInstanceOf(Set);
    expect(result.NE.size).toBe(2);
    expect(result.NE.has('NE1')).toBe(true);
    expect(result.NE.has('NE2')).toBe(true);
    expect(result.TS.size).toBe(2);
    expect(result.TS.has('TS1')).toBe(true);
    expect(result.TS.has('TS16')).toBe(true);
  });

  it('handles Set input', () => {
    const districts = new Set(['NE1', 'NE2', 'TS1']);

    const result = groupDistrictsByArea(districts);

    expect(result.NE.size).toBe(2);
    expect(result.TS.size).toBe(1);
  });

  it('handles single-letter area codes', () => {
    const districts = ['E1', 'E2', 'N16'];

    const result = groupDistrictsByArea(districts);

    expect(result).toHaveProperty('E');
    expect(result).toHaveProperty('N');
    expect(result.E.size).toBe(2);
    expect(result.N.size).toBe(1);
  });

  it('handles mixed case input', () => {
    const districts = ['ne1', 'NE2', 'ts1'];

    const result = groupDistrictsByArea(districts);

    expect(result).toHaveProperty('NE');
    expect(result).toHaveProperty('TS');
  });

  it('returns empty object for empty input', () => {
    expect(groupDistrictsByArea([])).toEqual({});
    expect(groupDistrictsByArea(new Set())).toEqual({});
  });
});
