import { describe, expect, it } from 'vitest';
import { normalizeBase64Image } from '../../apps-script/lib/driveGateway.js';

describe('drive gateway', () => {
  it('normalizes data uri payload', () => {
    const normalized = normalizeBase64Image('data:image/png;base64,AAAA');
    expect(normalized.mimeType).toBe('image/png');
    expect(normalized.base64).toBe('AAAA');
  });
});
