import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('apps script manifest access', () => {
  it('uses anonymous web app access for public API calls', () => {
    const manifestPath = path.resolve(process.cwd(), 'apps-script/appsscript.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    expect(manifest.webapp.access).toBe('ANYONE_ANONYMOUS');
  });
});
