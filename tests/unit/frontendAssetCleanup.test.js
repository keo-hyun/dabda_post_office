import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const WEB_DIR = path.resolve(process.cwd(), 'web');
const ASSET_DIR = path.join(WEB_DIR, 'assets');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

describe('frontend asset cleanup guards', () => {
  it('does not reference legacy image assets', () => {
    const files = [
      path.join(WEB_DIR, 'styles.css'),
      path.join(WEB_DIR, 'views', 'composeView.js'),
      path.join(WEB_DIR, 'views', 'mailboxView.js'),
      path.join(WEB_DIR, 'views', 'letterView.js')
    ];

    const content = files.map(read).join('\n');
    expect(content).not.toContain('letter-paper.png');
    expect(content).not.toContain('post.png');
    expect(content).not.toContain('post_2.png');
  });

  it('keeps required production assets', () => {
    ['Dear_Hope.png', 'From.png', 'post_3.png', 'audio_1.mp3'].forEach((name) => {
      expect(fs.existsSync(path.join(ASSET_DIR, name))).toBe(true);
    });
  });

  it('removes legacy image files from web/assets', () => {
    ['letter-paper.png', 'post.png', 'post_2.png'].forEach((name) => {
      expect(fs.existsSync(path.join(ASSET_DIR, name))).toBe(false);
    });
  });
});
