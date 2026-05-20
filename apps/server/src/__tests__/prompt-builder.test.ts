import { buildSystemPrompt } from '../lib/prompt-builder';
import type { DramaContext } from '@drama-buddy/shared';

describe('buildSystemPrompt', () => {
  it('should include drama title in system prompt', () => {
    const ctx: DramaContext = { title: '繁花', episode: 3 };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain('繁花');
    expect(prompt).toContain('第3集');
  });

  it('should handle missing episode gracefully', () => {
    const ctx: DramaContext = { title: '狂飙' };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain('狂飙');
    expect(prompt).not.toContain('undefined');
  });

  it('should include scene description when provided', () => {
    const ctx: DramaContext = {
      title: '漫长的季节',
      sceneDescription: '王响在工厂回忆往事',
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain('王响在工厂回忆往事');
  });

  it('should include current time when provided', () => {
    const ctx: DramaContext = {
      title: '繁花',
      currentTime: 125,
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain('2分5秒');
  });
});
