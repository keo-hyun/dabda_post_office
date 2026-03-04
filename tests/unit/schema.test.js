import { describe, expect, it } from 'vitest';
import { SHEETS, REQUIRED_SCRIPT_PROPS } from '../../src/shared/schema.js';

describe('schema contract', () => {
  it('defines required sheets and script properties', () => {
    expect(SHEETS.LETTERS.columns).toContain('visibility');
    expect(REQUIRED_SCRIPT_PROPS).toContain('ENTRY_CODE');
  });
});
