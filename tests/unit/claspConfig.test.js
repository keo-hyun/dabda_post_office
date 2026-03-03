import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('clasp config', () => {
  it('has clasp and manifest files', () => {
    expect(fs.existsSync('.clasp.json')).toBe(true);
    expect(fs.existsSync('apps-script/appsscript.json')).toBe(true);
  });
});
