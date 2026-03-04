import { describe, expect, it } from 'vitest';
import { PROVISIONED_RESOURCE_IDS, validateScriptProperties } from '../../src/shared/config.js';

describe('script properties', () => {
  it('requires spreadsheet and drive ids', () => {
    const result = validateScriptProperties({
      ENTRY_CODE: 'DABDA2026'
    });

    expect(result.ok).toBe(false);
    expect(result.missing).toContain('SPREADSHEET_ID');
    expect(result.missing).toContain('DRIVE_FOLDER_ID');
  });

  it('tracks provisioned production resource ids', () => {
    expect(PROVISIONED_RESOURCE_IDS.SPREADSHEET_ID).toBe('1GSKuJm9NyQYHWhB4SuZSqWe6CHEswFX5RGnEYZKnpI0');
    expect(PROVISIONED_RESOURCE_IDS.DRIVE_FOLDER_ID).toBe('1tB_M5qd_9c0-hmikoy5pqSr3QlV7Pwbr');
  });
});
