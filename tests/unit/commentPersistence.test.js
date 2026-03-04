import { describe, expect, it } from 'vitest';
import { buildSoftDeletePatch } from '../../src/backend/core/commentsCore.js';

describe('comment persistence', () => {
  it('builds soft delete patch with timestamp', () => {
    const patch = buildSoftDeletePatch(new Date('2026-03-25T00:00:00Z'));
    expect(patch.deleted_at).toContain('2026-03-25');
  });
});
