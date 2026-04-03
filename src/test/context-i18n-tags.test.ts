import { describe, it, expect } from 'vitest';
import { translations } from '@/context/LanguageContext';

/**
 * Unit Tests: i18n Localization for Tags Feature
 * 
 * Verifies that all required translation keys for the tags feature
 * are present in both English and Portuguese locales.
 */

describe('LanguageContext - Tags i18n Keys', () => {
  describe('English locale', () => {
    it('should have "tags" key', () => {
      expect(translations.en).toHaveProperty('tags');
      expect(typeof translations.en.tags).toBe('string');
      expect(translations.en.tags.length).toBeGreaterThan(0);
    });

    it('should have "addTag" key', () => {
      expect(translations.en).toHaveProperty('addTag');
      expect(typeof translations.en.addTag).toBe('string');
      expect(translations.en.addTag.length).toBeGreaterThan(0);
    });

    it('should have "pressEnterToAddTag" key', () => {
      expect(translations.en).toHaveProperty('pressEnterToAddTag');
      expect(typeof translations.en.pressEnterToAddTag).toBe('string');
      expect(translations.en.pressEnterToAddTag.length).toBeGreaterThan(0);
    });

    it('should have meaningful English text', () => {
      expect(translations.en.tags).toMatch(/tag/i);
      expect(translations.en.addTag).toMatch(/add/i);
      expect(translations.en.pressEnterToAddTag).toMatch(/enter|comma/i);
    });
  });

  describe('Portuguese locale', () => {
    it('should have "tags" key', () => {
      expect(translations.pt).toHaveProperty('tags');
      expect(typeof translations.pt.tags).toBe('string');
      expect(translations.pt.tags.length).toBeGreaterThan(0);
    });

    it('should have "addTag" key', () => {
      expect(translations.pt).toHaveProperty('addTag');
      expect(typeof translations.pt.addTag).toBe('string');
      expect(translations.pt.addTag.length).toBeGreaterThan(0);
    });

    it('should have "pressEnterToAddTag" key', () => {
      expect(translations.pt).toHaveProperty('pressEnterToAddTag');
      expect(typeof translations.pt.pressEnterToAddTag).toBe('string');
      expect(translations.pt.pressEnterToAddTag.length).toBeGreaterThan(0);
    });

    it('should have meaningful Portuguese text', () => {
      expect(translations.pt.tags).toMatch(/tag/i);
      expect(translations.pt.addTag).toMatch(/add|adicionar/i);
      expect(translations.pt.pressEnterToAddTag).toMatch(/pressione|enter|v[íi]rgula/i);
    });
  });

  describe('Locale consistency', () => {
    it('should have matching keys in both locales', () => {
      const enKeys = Object.keys(translations.en);
      const ptKeys = Object.keys(translations.pt);
      
      // At minimum, both should have the three tag-related keys
      const requiredKeys = ['tags', 'addTag', 'pressEnterToAddTag'];
      for (const key of requiredKeys) {
        expect(enKeys).toContain(key);
        expect(ptKeys).toContain(key);
      }
    });

    it('should have no empty translations', () => {
      const requiredKeys = ['tags', 'addTag', 'pressEnterToAddTag'];
      for (const key of requiredKeys) {
        expect(translations.en[key as keyof typeof translations.en]).toBeTruthy();
        expect(translations.pt[key as keyof typeof translations.pt]).toBeTruthy();
      }
    });
  });
});
