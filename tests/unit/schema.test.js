import { describe, expect, it } from 'vitest';
import { SHEETS, REQUIRED_SCRIPT_PROPS } from '../../src/shared/schema.js';

describe('schema contract', () => {
  it('defines required sheets and script properties', () => {
    expect(SHEETS.LETTERS.columns).toContain('visibility');
    expect(SHEETS.LETTERS.columns).toContain('email');
    expect(SHEETS.LETTERS.columns).not.toContain('image_file_id');
    expect(REQUIRED_SCRIPT_PROPS).toContain('ENTRY_CODE');
  });
});
