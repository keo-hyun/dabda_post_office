import { describe, expect, it } from 'vitest';
import { PROVISIONED_RESOURCE_IDS, validateScriptProperties } from '../../src/shared/config.js';

describe('script properties', () => {
  it('requires spreadsheet id only for provisioned resources', () => {
    const result = validateScriptProperties({
      ENTRY_CODE: 'DABDA2026'
    });

    expect(result.ok).toBe(false);
    expect(result.missing).toContain('SPREADSHEET_ID');
    expect(result.missing).not.toContain('DRIVE_FOLDER_ID');
  });

  it('tracks only active provisioned production resource ids', () => {
    expect(PROVISIONED_RESOURCE_IDS.SPREADSHEET_ID).toBe('1GSKuJm9NyQYHWhB4SuZSqWe6CHEswFX5RGnEYZKnpI0');
    expect('DRIVE_FOLDER_ID' in PROVISIONED_RESOURCE_IDS).toBe(false);
  });
});
