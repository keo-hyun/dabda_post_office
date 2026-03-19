import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const INDEX_PATH = path.resolve(process.cwd(), 'web', 'index.html');

describe('frontend asset versioning', () => {
  it('loads app assets with version queries so deploys can bypass stale mobile caches', () => {
    const indexHtml = fs.readFileSync(INDEX_PATH, 'utf8');

    expect(indexHtml).toContain('id="appStylesheet"');
    expect(indexHtml).toContain("const assetVersion = new URLSearchParams(window.location.search).get('v') || '20260319-cache1';");
    expect(indexHtml).toContain("stylesheet.href = `./styles.css?v=${assetVersion}`;");
    expect(indexHtml).toContain("appScript.src = `./app.js?v=${assetVersion}`;");
  });
});
