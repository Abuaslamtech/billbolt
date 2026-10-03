import { cycleKey, formatYMD, parseDateSafe } from './cycle.utils';

describe('cycle.utils', () => {
  describe('parseDateSafe', () => {
    it('should parse YYYY-MM-DD string into local calendar components without UTC rollback', () => {
      const parsed = parseDateSafe('2026-09-14');
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(8); // September is index 8
      expect(parsed.getDate()).toBe(14);
    });

    it('should parse ISO date strings correctly', () => {
      const parsed = parseDateSafe('2026-03-15T10:30:00.000Z');
      expect(parsed).toBeInstanceOf(Date);
      expect(isNaN(parsed.getTime())).toBe(false);
    });

    it('should pass through Date objects', () => {
      const now = new Date(2026, 5, 20);
      const parsed = parseDateSafe(now);
      expect(parsed).toBe(now);
      expect(parsed.getDate()).toBe(20);
    });

    it('should default to current date when null, undefined, or empty string', () => {
      const d1 = parseDateSafe(null);
      const d2 = parseDateSafe(undefined);
      const d3 = parseDateSafe('');
      expect(d1).toBeInstanceOf(Date);
      expect(d2).toBeInstanceOf(Date);
      expect(d3).toBeInstanceOf(Date);
      expect(isNaN(d1.getTime())).toBe(false);
    });

    it('should return Invalid Date for unparseable strings so callers can catch bad input', () => {
      const parsed = parseDateSafe('not-a-valid-date');
      expect(isNaN(parsed.getTime())).toBe(true);
    });
  });

  describe('formatYMD', () => {
    it('should format Date object to YYYY-MM-DD', () => {
      const date = new Date(2026, 8, 14); // 2026-09-14
      expect(formatYMD(date)).toBe('2026-09-14');
    });

    it('should format date string to YYYY-MM-DD', () => {
      expect(formatYMD('2026-09-14')).toBe('2026-09-14');
    });

    it('should pad single-digit months and days', () => {
      const date = new Date(2026, 0, 5); // 2026-01-05
      expect(formatYMD(date)).toBe('2026-01-05');
    });

    it('should default to today if parameter is omitted', () => {
      const result = formatYMD();
      expect(/^\d{4}-\d{2}-\d{2}$/.test(result)).toBe(true);
    });
  });

  describe('cycleKey', () => {
    it('should compute cycle key starting on the 14th for dates on or after 14th', () => {
      // Date object
      const key1 = cycleKey(new Date(2026, 8, 14)); // Sept 14
      expect(key1).toBe('2026-09-14_2026-10-13');

      // Date string
      const key2 = cycleKey('2026-09-14');
      expect(key2).toBe('2026-09-14_2026-10-13');
    });

    it('should compute cycle key ending on the 13th for dates before the 14th', () => {
      // Date object
      const key1 = cycleKey(new Date(2026, 8, 13)); // Sept 13
      expect(key1).toBe('2026-08-14_2026-09-13');

      // Date string
      const key2 = cycleKey('2026-09-13');
      expect(key2).toBe('2026-08-14_2026-09-13');
    });

    it('should handle year rollover correctly', () => {
      // Jan 10 -> cycle starts Dec 14 of previous year
      const key = cycleKey(new Date(2026, 0, 10)); // 2026-01-10
      expect(key).toBe('2025-12-14_2026-01-13');

      // Dec 15 -> cycle ends Jan 13 of following year
      const key2 = cycleKey(new Date(2026, 11, 15)); // 2026-12-15
      expect(key2).toBe('2026-12-14_2027-01-13');
    });

    it('should handle leap years correctly', () => {
      // Leap year 2028: Feb 14 -> 2028-02-14_2028-03-13
      const key1 = cycleKey('2028-02-14');
      expect(key1).toBe('2028-02-14_2028-03-13');

      // Leap year 2028: Feb 13 -> 2028-01-14_2028-02-13
      const key2 = cycleKey('2028-02-13');
      expect(key2).toBe('2028-01-14_2028-02-13');

      // Leap day Feb 29 -> 2028-02-14_2028-03-13
      const key3 = cycleKey('2028-02-29');
      expect(key3).toBe('2028-02-14_2028-03-13');
    });

    it('should fallback safely to current cycle when null, undefined, or invalid string provided', () => {
      const keyNull = cycleKey(null as any);
      const keyUndefined = cycleKey(undefined);
      const keyInvalid = cycleKey('garbage-not-a-date');

      for (const k of [keyNull, keyUndefined, keyInvalid]) {
        expect(k).toContain('_');
        const [start, end] = k.split('_');
        expect(/^\d{4}-\d{2}-14$/.test(start)).toBe(true);
        expect(/^\d{4}-\d{2}-13$/.test(end)).toBe(true);
      }
    });

    it('should default to current cycle if parameter is omitted', () => {
      const key = cycleKey();
      expect(key).toContain('_');
      const [start, end] = key.split('_');
      expect(/^\d{4}-\d{2}-14$/.test(start)).toBe(true);
      expect(/^\d{4}-\d{2}-13$/.test(end)).toBe(true);
    });
  });
});
