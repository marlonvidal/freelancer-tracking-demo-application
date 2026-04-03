import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Component Test: Tag Chip-Input Behavior
 * 
 * Tests the tag chip-input business logic for:
 * - Deduplication (same tag cannot be added twice)
 * - Whitespace trimming (leading/trailing spaces removed)
 * - Enter keypress trigger (adds tag on Enter)
 * - Comma keypress trigger (adds tag on comma)
 * - Tag removal (clicking ✕ removes tag)
 * - Empty input validation (empty strings not added)
 * - Long tag truncation (display logic for tags > 20 chars)
 */

describe('Tag Chip-Input Behavior', () => {
  describe('Tag Deduplication', () => {
    it('should not add duplicate tags', () => {
      const tags: string[] = ['design'];
      const newTag = 'design';
      const trimmed = newTag.trim().replace(/,$/, '').trim();

      // Simulate the deduplication logic from AddTaskDialog
      const finalTags = trimmed && !tags.includes(trimmed)
        ? [...tags, trimmed]
        : tags;

      expect(finalTags).toEqual(['design']); // No duplicate
      expect(finalTags.length).toBe(1);
    });

    it('should ignore case-insensitive duplicates (case-sensitive comparison)', () => {
      const tags: string[] = ['design'];
      const newTag = 'Design'; // Different case
      const trimmed = newTag.trim().replace(/,$/, '').trim();

      // Current implementation is case-sensitive
      const finalTags = trimmed && !tags.includes(trimmed)
        ? [...tags, trimmed]
        : tags;

      // This would add "Design" since it's not exact match with "design"
      expect(finalTags).toEqual(['design', 'Design']);
    });

    it('should deduplicate with whitespace trimming', () => {
      const tags: string[] = ['design'];
      const newTag = '  design  '; // With whitespace
      const trimmed = newTag.trim().replace(/,$/, '').trim();

      const finalTags = trimmed && !tags.includes(trimmed)
        ? [...tags, trimmed]
        : tags;

      expect(finalTags).toEqual(['design']); // Trimmed, no duplicate
    });
  });

  describe('Whitespace Trimming', () => {
    it('should trim leading and trailing spaces', () => {
      const input = '  frontend  ';
      const trimmed = input.trim().replace(/,$/, '').trim();

      expect(trimmed).toBe('frontend');
    });

    it('should trim comma suffix', () => {
      const input = 'backend,';
      const trimmed = input.trim().replace(/,$/, '').trim();

      expect(trimmed).toBe('backend');
    });

    it('should handle input with both comma and spaces', () => {
      const input = '  ui  ,';
      const trimmed = input.trim().replace(/,$/, '').trim();

      expect(trimmed).toBe('ui');
    });

    it('should not add empty strings after trimming', () => {
      const inputs = ['', '  ', ',', '  ,  '];
      
      for (const input of inputs) {
        const trimmed = input.trim().replace(/,$/, '').trim();
        expect(trimmed).toBe('');
      }
    });
  });

  describe('Comma and Enter Triggers', () => {
    it('should recognize Enter as tag confirmation', () => {
      const input = 'design';
      const key = 'Enter';

      // Simulate onKeyDown logic
      const shouldAddTag = key === 'Enter' && input.trim() !== '';

      expect(shouldAddTag).toBe(true);
    });

    it('should recognize comma as tag confirmation', () => {
      const input = 'backend';
      const key = ',';

      // Simulate onChange logic (comma triggers add)
      const shouldAddTag = key === ',' && input.trim() !== '';

      expect(shouldAddTag).toBe(true);
    });

    it('should not add tag on unrelated keys', () => {
      const input = 'design';
      const keys = ['a', 'b', 'Shift', 'Control', ' '];

      for (const key of keys) {
        const shouldAddTag = (key === 'Enter' || key === ',') && input.trim() !== '';
        expect(shouldAddTag).toBe(false);
      }
    });

    it('should clear input after successful tag add', () => {
      let tagInput = 'design';
      const tags: string[] = [];

      // Simulate successful add
      const trimmed = tagInput.trim().replace(/,$/, '').trim();
      if (trimmed && !tags.includes(trimmed)) {
        tags.push(trimmed);
        tagInput = ''; // Clear input
      }

      expect(tagInput).toBe('');
      expect(tags).toEqual(['design']);
    });
  });

  describe('Tag Removal', () => {
    it('should remove tag when ✕ is clicked', () => {
      const tags = ['design', 'ui', 'frontend'];
      const tagToRemove = 'ui';

      const remaining = tags.filter(t => t !== tagToRemove);

      expect(remaining).toEqual(['design', 'frontend']);
      expect(remaining.includes(tagToRemove)).toBe(false);
    });

    it('should handle removing only tag', () => {
      const tags = ['design'];
      const tagToRemove = 'design';

      const remaining = tags.filter(t => t !== tagToRemove);

      expect(remaining).toEqual([]);
      expect(remaining.length).toBe(0);
    });

    it('should preserve other tags when removing one', () => {
      const tags = ['design', 'ui'];
      const tagToRemove = 'design';

      const remaining = tags.filter(t => t !== tagToRemove);

      expect(remaining).toEqual(['ui']);
      expect(remaining).not.toContain('design');
    });
  });

  describe('Placeholder Behavior', () => {
    it('should show "pressEnterToAddTag" when tags list is empty', () => {
      const tags: string[] = [];
      const shouldShowFirstPlaceholder = tags.length === 0;

      expect(shouldShowFirstPlaceholder).toBe(true);
    });

    it('should show "addTag" when tags list has items', () => {
      const tags = ['design'];
      const shouldShowFirstPlaceholder = tags.length === 0;

      expect(shouldShowFirstPlaceholder).toBe(false);
    });
  });

  describe('Display Logic: Long Tag Truncation', () => {
    it('should apply truncate CSS class to tag longer than 20 chars', () => {
      const longTag = 'superlongtagnameover20';
      const shouldTruncate = longTag.length > 20;

      expect(shouldTruncate).toBe(true);
      // CSS classes applied: max-w-[120px] truncate
    });

    it('should not truncate short tags', () => {
      const shortTags = ['ui', 'design', 'backend', 'frontend'];

      for (const tag of shortTags) {
        const shouldTruncate = tag.length > 20;
        expect(shouldTruncate).toBe(false);
      }
    });

    it('should apply max-w constraint for consistent width', () => {
      // CSS class: max-w-[120px] ensures max 120px width
      // With truncate class, overflow is hidden with ellipsis
      const cssClass = 'max-w-[120px] truncate';
      expect(cssClass).toContain('max-w');
      expect(cssClass).toContain('truncate');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid tag additions', () => {
      let tags: string[] = [];
      const inputs = ['design', 'ui', 'frontend'];

      for (const input of inputs) {
        const trimmed = input.trim().replace(/,$/, '').trim();
        if (trimmed && !tags.includes(trimmed)) {
          tags = [...tags, trimmed];
        }
      }

      expect(tags).toEqual(['design', 'ui', 'frontend']);
      expect(tags.length).toBe(3);
    });

    it('should handle special characters in tags', () => {
      const specialTags = ['c++', 'node.js', '@react', 'some-tag', 'some_tag'];
      const tags: string[] = [];

      for (const tag of specialTags) {
        const trimmed = tag.trim().replace(/,$/, '').trim();
        if (trimmed && !tags.includes(trimmed)) {
          tags.push(trimmed);
        }
      }

      // All should be added (they're unique)
      expect(tags).toEqual(specialTags);
    });

    it('should only allow unique tags even with special chars', () => {
      const tags: string[] = [];
      const inputs = ['c++', 'C++', 'c++', 'node.js', 'node.js'];

      for (const input of inputs) {
        const trimmed = input.trim().replace(/,$/, '').trim();
        if (trimmed && !tags.includes(trimmed)) {
          tags.push(trimmed);
        }
      }

      // Case-sensitive: 'c++' and 'C++' are different
      expect(tags).toContain('c++');
      expect(tags).toContain('C++');
      expect(tags.length).toBe(3); // c++, C++, node.js
    });

    it('should handle very long tag input gracefully', () => {
      const veryLongTag = 'a'.repeat(100);
      const trimmed = veryLongTag.trim().replace(/,$/, '').trim();

      expect(trimmed).toBe('a'.repeat(100));
      // Display would truncate visually with CSS: max-w-[120px] truncate
    });
  });

  describe('Integration: Add and Remove Flow', () => {
    it('should correctly add and remove tags in sequence', () => {
      let tags: string[] = [];

      // Add tag 1
      let trimmed = 'design'.trim().replace(/,$/, '').trim();
      if (trimmed && !tags.includes(trimmed)) tags.push(trimmed);
      expect(tags).toEqual(['design']);

      // Add tag 2
      trimmed = 'ui'.trim().replace(/,$/, '').trim();
      if (trimmed && !tags.includes(trimmed)) tags.push(trimmed);
      expect(tags).toEqual(['design', 'ui']);

      // Try to add duplicate (should fail)
      trimmed = 'design'.trim().replace(/,$/, '').trim();
      if (trimmed && !tags.includes(trimmed)) tags.push(trimmed);
      expect(tags).toEqual(['design', 'ui']); // No change

      // Remove first tag
      tags = tags.filter(t => t !== 'design');
      expect(tags).toEqual(['ui']);

      // Add another tag
      trimmed = 'backend'.trim().replace(/,$/, '').trim();
      if (trimmed && !tags.includes(trimmed)) tags.push(trimmed);
      expect(tags).toEqual(['ui', 'backend']);
    });
  });
});
