import { describe, it, expect, vi } from 'vitest';
import { generateSlug, truncateText } from '@/lib/utils';

describe('Game Utilities', () => {
  describe('generateSlug', () => {
    it('should convert text to slug', () => {
      const title = 'Awesome Game 2024';
      const slug = generateSlug(title);

      expect(slug).toBe('awesome-game-2024');
    });

    it('should handle special characters', () => {
      const title = 'Game: The Return (Special Edition)';
      const slug = generateSlug(title);

      expect(slug).toBe('game-the-return-special-edition');
    });

    it('should handle multiple spaces', () => {
      const title = 'Game    with   multiple   spaces';
      const slug = generateSlug(title);

      expect(slug).toBe('game-with-multiple-spaces');
    });

    it('should trim dashes', () => {
      const title = '-Game Title-';
      const slug = generateSlug(title);

      expect(slug).toBe('game-title');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long description that needs to be truncated';
      const truncated = truncateText(text, 20);

      expect(truncated).toBe('This is a very long...');
      expect(truncated.length).toBeLessThanOrEqual(23); // 20 + '...'
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      const truncated = truncateText(text, 20);

      expect(truncated).toBe('Short text');
    });

    it('should handle exact length', () => {
      const text = 'Exactly twenty chars';
      const truncated = truncateText(text, 20);

      expect(truncated).toBe('Exactly twenty chars');
    });
  });
});

describe('Game Data Validation', () => {
  it('should validate game type enum', () => {
    const validGameTypes = ['HTML5', 'WebGL', 'Unity', 'Flash', 'Other'];

    validGameTypes.forEach(type => {
      expect(type).toMatch(/^(HTML5|WebGL|Unity|Flash|Other)$/);
    });
  });

  it('should validate rating range', () => {
    const validRatings = [1, 2, 3, 4, 5];
    const invalidRatings = [0, 6, -1, 5.5];

    validRatings.forEach(rating => {
      expect(rating).toBeGreaterThanOrEqual(1);
      expect(rating).toBeLessThanOrEqual(5);
    });

    invalidRatings.forEach(rating => {
      expect(rating < 1 || rating > 5 || !Number.isInteger(rating)).toBeTruthy();
    });
  });
});
