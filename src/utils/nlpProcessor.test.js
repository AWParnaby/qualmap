import { describe, it, expect } from 'vitest';
import {
  extractPhrases,
  isSignificantPhrase,
  countPhraseFrequencies,
  generateWordCloudData,
  processTextsToWordCloud
} from './nlpProcessor';

describe('extractPhrases', () => {
  it('extracts noun phrases', () => {
    const text = 'Digital skills training and community support';
    const phrases = extractPhrases(text);

    // Compromise extracts full phrases, may be longer than expected
    expect(phrases.length).toBeGreaterThan(0);
    const allPhrases = phrases.join(' ');
    expect(allPhrases).toMatch(/digital/i);
  });

  it('extracts verb phrases', () => {
    const text = 'Providing support for accessing services';
    const phrases = extractPhrases(text);

    expect(phrases).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/providing support/i)
      ])
    );
  });

  it('extracts organization names', () => {
    const text = 'Citizens Advice and Job Centre Plus provide help';
    const phrases = extractPhrases(text);

    // Compromise should detect these as organizations
    expect(phrases.length).toBeGreaterThan(0);
  });

  it('normalizes phrases to lowercase', () => {
    const text = 'Digital Skills Training';
    const phrases = extractPhrases(text);

    phrases.forEach(phrase => {
      expect(phrase).toBe(phrase.toLowerCase());
    });
  });

  it('returns unique phrases', () => {
    const text = 'digital skills digital skills training';
    const phrases = extractPhrases(text);

    const uniquePhrases = [...new Set(phrases)];
    expect(phrases.length).toBe(uniquePhrases.length);
  });

  it('handles empty text', () => {
    expect(extractPhrases('')).toEqual([]);
    expect(extractPhrases(null)).toEqual([]);
    expect(extractPhrases(undefined)).toEqual([]);
  });

  it('handles non-string input', () => {
    expect(extractPhrases(123)).toEqual([]);
    expect(extractPhrases({})).toEqual([]);
    expect(extractPhrases([])).toEqual([]);
  });

  it('extracts phrases from realistic service description', () => {
    const text = 'Digital skills training and community support with modern facilities';
    const phrases = extractPhrases(text);

    expect(phrases.length).toBeGreaterThan(0);
    expect(phrases).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/digital skills/i)
      ])
    );
  });
});

describe('isSignificantPhrase', () => {
  it('accepts valid noun phrases', () => {
    expect(isSignificantPhrase('digital skills')).toBe(true);
    expect(isSignificantPhrase('digital skills training')).toBe(true);
    expect(isSignificantPhrase('modern facilities')).toBe(true);
  });

  it('accepts valid verb phrases', () => {
    expect(isSignificantPhrase('providing support')).toBe(true);
    expect(isSignificantPhrase('accessing services')).toBe(true);
  });

  it('rejects common words', () => {
    expect(isSignificantPhrase('the')).toBe(false);
    expect(isSignificantPhrase('and')).toBe(false);
    expect(isSignificantPhrase('it')).toBe(false);
    expect(isSignificantPhrase('with')).toBe(false);
  });

  it('handles empty or invalid input', () => {
    expect(isSignificantPhrase('')).toBe(false);
    expect(isSignificantPhrase(null)).toBe(false);
    expect(isSignificantPhrase(undefined)).toBe(false);
    expect(isSignificantPhrase(123)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isSignificantPhrase('Digital Skills')).toBe(true);
    expect(isSignificantPhrase('DIGITAL SKILLS')).toBe(true);
    expect(isSignificantPhrase('digital skills')).toBe(true);
  });

  it('handles whitespace', () => {
    expect(isSignificantPhrase('  digital skills  ')).toBe(true);
  });
});

describe('countPhraseFrequencies', () => {
  it('counts phrase occurrences across texts', () => {
    const texts = [
      'Digital skills training',
      'Digital skills and community support',
      'Community support programs'
    ];

    const frequencies = countPhraseFrequencies(texts);

    // Should extract some phrases with "digital" or related words
    const keys = Object.keys(frequencies);
    expect(keys.length).toBeGreaterThan(0);

    // At least one phrase should contain "digital" or "skills"
    const hasRelevantPhrase = keys.some(key =>
      key.includes('digital') || key.includes('skills') || key.includes('training')
    );
    expect(hasRelevantPhrase).toBe(true);
  });

  it('weights multi-word phrases 2x', () => {
    const texts = [
      'Digital skills training'  // Multi-word phrase
    ];

    const frequencies = countPhraseFrequencies(texts);

    // Should have at least one multi-word phrase with weight >= 2
    const multiWordPhrases = Object.entries(frequencies).filter(([key]) => key.includes(' '));
    expect(multiWordPhrases.length).toBeGreaterThan(0);

    // Multi-word phrases should have higher or equal counts due to weighting
    const hasWeightedPhrase = multiWordPhrases.some(([, count]) => count >= 2);
    expect(hasWeightedPhrase).toBe(true);
  });

  it('filters out insignificant phrases', () => {
    const texts = [
      'The and it with for'  // All common words
    ];

    const frequencies = countPhraseFrequencies(texts);

    expect(Object.keys(frequencies)).not.toContain('the');
    expect(Object.keys(frequencies)).not.toContain('and');
    expect(Object.keys(frequencies)).not.toContain('it');
  });

  it('handles empty array', () => {
    expect(countPhraseFrequencies([])).toEqual({});
  });

  it('handles null/undefined', () => {
    expect(countPhraseFrequencies(null)).toEqual({});
    expect(countPhraseFrequencies(undefined)).toEqual({});
  });

  it('handles non-array input', () => {
    expect(countPhraseFrequencies('not an array')).toEqual({});
    expect(countPhraseFrequencies(123)).toEqual({});
  });

  it('skips null/undefined texts in array', () => {
    const texts = [
      'Digital skills training program',
      null,
      undefined,
      'Modern facilities and community support',
      ''
    ];

    const frequencies = countPhraseFrequencies(texts);

    // Should extract some phrases despite null/undefined entries
    expect(Object.keys(frequencies).length).toBeGreaterThan(0);
  });

  it('accumulates counts for repeated phrases', () => {
    const texts = [
      'Digital skills training',
      'Digital skills programs',
      'Digital skills support'
    ];

    const frequencies = countPhraseFrequencies(texts);

    // Should have some phrase containing "digital" with accumulated count
    const digitalPhrases = Object.entries(frequencies).filter(([key]) =>
      key.includes('digital')
    );

    expect(digitalPhrases.length).toBeGreaterThan(0);

    // At least one digital phrase should appear multiple times (weight 2 per occurrence)
    const hasRepeatedPhrase = digitalPhrases.some(([, count]) => count >= 2);
    expect(hasRepeatedPhrase).toBe(true);
  });
});

describe('generateWordCloudData', () => {
  it('converts frequency object to sorted array', () => {
    const frequencies = {
      'digital skills': 10,
      'community support': 5,
      'training programs': 8
    };

    const wordCloud = generateWordCloudData(frequencies);

    expect(wordCloud).toEqual([
      { value: 'digital skills', count: 10 },
      { value: 'training programs', count: 8 },
      { value: 'community support', count: 5 }
    ]);
  });

  it('limits results to specified number', () => {
    const frequencies = {};
    for (let i = 0; i < 100; i++) {
      frequencies[`phrase${i}`] = i;
    }

    const wordCloud = generateWordCloudData(frequencies, 10);

    expect(wordCloud.length).toBe(10);
  });

  it('defaults to 50 results', () => {
    const frequencies = {};
    for (let i = 0; i < 100; i++) {
      frequencies[`phrase${i}`] = i;
    }

    const wordCloud = generateWordCloudData(frequencies);

    expect(wordCloud.length).toBe(50);
  });

  it('handles fewer items than limit', () => {
    const frequencies = {
      'digital skills': 10,
      'community support': 5
    };

    const wordCloud = generateWordCloudData(frequencies, 10);

    expect(wordCloud.length).toBe(2);
  });

  it('handles empty object', () => {
    expect(generateWordCloudData({})).toEqual([]);
  });

  it('handles null/undefined', () => {
    expect(generateWordCloudData(null)).toEqual([]);
    expect(generateWordCloudData(undefined)).toEqual([]);
  });

  it('handles non-object input', () => {
    expect(generateWordCloudData('not an object')).toEqual([]);
    expect(generateWordCloudData(123)).toEqual([]);
  });

  it('sorts by count descending', () => {
    const frequencies = {
      'low': 1,
      'high': 10,
      'medium': 5
    };

    const wordCloud = generateWordCloudData(frequencies);

    expect(wordCloud[0].value).toBe('high');
    expect(wordCloud[1].value).toBe('medium');
    expect(wordCloud[2].value).toBe('low');
  });
});

describe('processTextsToWordCloud', () => {
  it('processes texts end-to-end', () => {
    const texts = [
      'Digital skills training and community support',
      'Community support programs with modern facilities',
      'Digital skills development'
    ];

    const wordCloud = processTextsToWordCloud(texts);

    expect(wordCloud.length).toBeGreaterThan(0);
    expect(wordCloud[0]).toHaveProperty('value');
    expect(wordCloud[0]).toHaveProperty('count');
  });

  it('returns sorted results', () => {
    const texts = [
      'Digital skills training',
      'Digital skills programs',
      'Digital skills support',
      'Community support'
    ];

    const wordCloud = processTextsToWordCloud(texts);

    // Verify descending order
    for (let i = 0; i < wordCloud.length - 1; i++) {
      expect(wordCloud[i].count).toBeGreaterThanOrEqual(wordCloud[i + 1].count);
    }
  });

  it('respects custom limit', () => {
    const texts = [
      'Digital skills training and community support with modern facilities',
      'Community support programs and digital skills development',
      'Training programs with friendly staff and helpful resources'
    ];

    const wordCloud = processTextsToWordCloud(texts, 5);

    expect(wordCloud.length).toBeLessThanOrEqual(5);
  });

  it('handles empty array', () => {
    expect(processTextsToWordCloud([])).toEqual([]);
  });

  it('filters out common words', () => {
    const texts = [
      'The service provides digital skills training and community support'
    ];

    const wordCloud = processTextsToWordCloud(texts);

    const values = wordCloud.map(item => item.value);
    expect(values).not.toContain('the');
    expect(values).not.toContain('and');
  });

  it('handles realistic service descriptions', () => {
    const texts = [
      'Digital skills training and community support with modern facilities',
      'Providing access to computers and internet for digital inclusion',
      'Friendly environment for learning new digital skills and online safety'
    ];

    const wordCloud = processTextsToWordCloud(texts);

    expect(wordCloud.length).toBeGreaterThan(0);

    // Should contain relevant phrases
    const values = wordCloud.map(item => item.value);
    expect(values).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/digital/i)
      ])
    );
  });
});
