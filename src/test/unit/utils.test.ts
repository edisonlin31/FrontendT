import { describe, it, expect } from 'vitest';
import { 
  formatDate, 
  getStatusColor,
  getPriorityColor,
  getCriticalColor,
  getLevelColor,
  cn
} from '../../lib/utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('1');
      expect(formatted).toContain('2023');
    });

    it('should handle different dates', () => {
      const date = new Date('2023-12-25T18:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('Dec');
      expect(formatted).toContain('2023');
      // The day might be 25 or 26 depending on timezone, so check for both
      expect(formatted).toMatch(/\b(25|26)\b/);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for New status', () => {
      expect(getStatusColor('New')).toBe('bg-blue-100 text-blue-800');
    });

    it('should return correct color for Attending status', () => {
      expect(getStatusColor('Attending')).toBe('bg-yellow-100 text-yellow-800');
    });

    it('should return correct color for Completed status', () => {
      expect(getStatusColor('Completed')).toBe('bg-green-100 text-green-800');
    });

    it('should return correct color for Escalated status', () => {
      expect(getStatusColor('Escalated')).toBe('bg-orange-100 text-orange-800');
    });

    it('should return correct color for Resolved status', () => {
      expect(getStatusColor('Resolved')).toBe('bg-green-100 text-green-800');
    });

    it('should return default color for unknown status', () => {
      expect(getStatusColor('Unknown')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getPriorityColor', () => {
    it('should return correct color for Low priority', () => {
      expect(getPriorityColor('Low')).toBe('bg-gray-100 text-gray-800');
    });

    it('should return correct color for Medium priority', () => {
      expect(getPriorityColor('Medium')).toBe('bg-yellow-100 text-yellow-800');
    });

    it('should return correct color for High priority', () => {
      expect(getPriorityColor('High')).toBe('bg-red-100 text-red-800');
    });

    it('should return default color for unknown priority', () => {
      expect(getPriorityColor('Unknown')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getCriticalColor', () => {
    it('should return correct color for C1', () => {
      expect(getCriticalColor('C1')).toBe('bg-red-100 text-red-800');
    });

    it('should return correct color for C2', () => {
      expect(getCriticalColor('C2')).toBe('bg-orange-100 text-orange-800');
    });

    it('should return correct color for C3', () => {
      expect(getCriticalColor('C3')).toBe('bg-yellow-100 text-yellow-800');
    });

    it('should return default color for unknown critical value', () => {
      expect(getCriticalColor('Unknown')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getLevelColor', () => {
    it('should return correct color for L1', () => {
      expect(getLevelColor('L1')).toBe('bg-green-500 text-white');
    });

    it('should return correct color for L2', () => {
      expect(getLevelColor('L2')).toBe('bg-orange-500 text-white');
    });

    it('should return correct color for L3', () => {
      expect(getLevelColor('L3')).toBe('bg-red-500 text-white');
    });

    it('should return default color for unknown level', () => {
      expect(getLevelColor('Unknown')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('cn (className utility)', () => {
    it('should combine class names', () => {
      const result = cn('bg-red-500', 'text-white');
      expect(result).toContain('bg-red-500');
      expect(result).toContain('text-white');
    });

    it('should handle conditional classes', () => {
      const shouldInclude = true;
      const result = cn('base-class', shouldInclude && 'conditional-class');
      expect(result).toContain('base-class');
      expect(result).toContain('conditional-class');
    });

    it('should filter out falsy values', () => {
      const shouldInclude = false;
      const result = cn('base-class', shouldInclude && 'should-not-appear', null, undefined);
      expect(result).toContain('base-class');
      expect(result).not.toContain('should-not-appear');
    });
  });
});