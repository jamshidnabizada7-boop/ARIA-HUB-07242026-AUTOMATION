import { describe, it, expect, vi } from 'vitest';
import { parseJSON, retry } from './helpers';

describe('AI helpers', () => {
  describe('parseJSON', () => {
    it('parses valid JSON', () => {
      const out = parseJSON('{"text":"hello","n":5}');
      expect(out).toEqual({ text: 'hello', n: 5 });
    });

    it('strips markdown code fences', () => {
      const out = parseJSON('```json\n{"text":"hi"}\n```');
      expect(out).toEqual({ text: 'hi' });
    });

    it('extracts JSON from surrounding prose', () => {
      const out = parseJSON('Here is the result: {"text":"x"} hope it helps');
      expect(out).toEqual({ text: 'x' });
    });

    it('returns null for non-JSON input', () => {
      expect(parseJSON('just plain text')).toBeNull();
      expect(parseJSON('')).toBeNull();
    });

    it('returns null for malformed JSON', () => {
      expect(parseJSON('{invalid')).toBeNull();
    });
  });

  describe('retry', () => {
    it('returns result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('ok');
      const result = await retry(fn);
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure then succeeds', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail1'))
        .mockRejectedValueOnce(new Error('fail2'))
        .mockResolvedValueOnce('success');
      const result = await retry(fn, 3, 10); // 10ms base for fast test
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('throws after max retries', async () => {
      const err = new Error('always fails');
      const fn = vi.fn().mockRejectedValue(err);
      await expect(retry(fn, 2, 10)).rejects.toThrow('always fails');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
