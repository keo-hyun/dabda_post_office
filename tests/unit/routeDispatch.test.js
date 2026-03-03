import { describe, expect, it } from 'vitest';
import { resolvePath } from '../../apps-script/routes/static.js';

describe('route dispatch', () => {
  it('resolves root to index path', () => {
    expect(resolvePath('/')).toBe('/index.html');
  });
});
