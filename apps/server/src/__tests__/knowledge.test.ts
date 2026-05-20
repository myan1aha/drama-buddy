import { findDramaKnowledge, filterKnowledgeByEpisode, knowledgeToPrompt } from '../lib/knowledge';

describe('Knowledge Base', () => {
  describe('findDramaKnowledge', () => {
    it('should find drama by exact title', () => {
      const result = findDramaKnowledge('繁花');
      expect(result).not.toBeNull();
      expect(result!.title).toBe('繁花');
    });

    it('should find drama by alias', () => {
      const result = findDramaKnowledge('The Knockout');
      expect(result).not.toBeNull();
      expect(result!.title).toBe('狂飙');
    });

    it('should find drama by fuzzy match', () => {
      const result = findDramaKnowledge('漫长的季节');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('manchangdejijie');
    });

    it('should return null for unknown drama', () => {
      const result = findDramaKnowledge('一部不存在的剧');
      expect(result).toBeNull();
    });

    it('should find Breaking Bad by English name', () => {
      const result = findDramaKnowledge('Breaking Bad');
      expect(result).not.toBeNull();
      expect(result!.title).toBe('Breaking Bad');
    });

    it('should find Breaking Bad by Chinese name', () => {
      const result = findDramaKnowledge('绝命毒师');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('breakingbad');
    });
  });

  describe('filterKnowledgeByEpisode', () => {
    it('should filter characters by firstAppearance', () => {
      const drama = findDramaKnowledge('繁花')!;
      const filtered = filterKnowledgeByEpisode(drama, 2);

      const names = filtered.characters.map((c: any) => c.name);
      expect(names).toContain('阿宝');
      expect(names).toContain('玲子');
      expect(names).not.toContain('李李');
    });

    it('should filter relationships by revealedAt', () => {
      const drama = findDramaKnowledge('繁花')!;
      const filtered = filterKnowledgeByEpisode(drama, 2);

      const hasLiLiRelation = filtered.relationships.some(
        (r: any) => r.from === '阿宝' && r.to === '李李'
      );
      expect(hasLiLiRelation).toBe(false);

      const hasMentorRelation = filtered.relationships.some(
        (r: any) => r.from === '阿宝' && r.to === '爷叔'
      );
      expect(hasMentorRelation).toBe(true);
    });

    it('should filter plotPoints by episode', () => {
      const drama = findDramaKnowledge('狂飙')!;
      const filtered = filterKnowledgeByEpisode(drama, 10);

      expect(filtered.plotSoFar.length).toBeGreaterThan(0);
      expect(filtered.plotSoFar.every((p: any) => p.episode <= 10)).toBe(true);
    });

    it('should filter Breaking Bad - hide Gus before episode 11', () => {
      const drama = findDramaKnowledge('Breaking Bad')!;
      const filtered = filterKnowledgeByEpisode(drama, 7);

      const names = filtered.characters.map((c: any) => c.name);
      expect(names).toContain('Walter White');
      expect(names).toContain('Jesse Pinkman');
      expect(names).toContain('Tuco Salamanca');
      expect(names).not.toContain('Gustavo Fring');
      expect(names).not.toContain('Todd Alquist');
    });

    it('should filter Breaking Bad - hide Hank discovery before episode 54', () => {
      const drama = findDramaKnowledge('Breaking Bad')!;
      const filtered = filterKnowledgeByEpisode(drama, 40);

      const hasHankDiscovery = filtered.relationships.some(
        (r: any) => r.from === 'Hank Schrader' && r.to === 'Walter White' && r.type === 'enemy'
      );
      expect(hasHankDiscovery).toBe(false);

      const names = filtered.characters.map((c: any) => c.name);
      expect(names).toContain('Gustavo Fring');
    });

    it('should show all Breaking Bad content at episode 62', () => {
      const drama = findDramaKnowledge('Breaking Bad')!;
      const filtered = filterKnowledgeByEpisode(drama, 62);

      expect(filtered.characters.length).toBe(12);
      expect(filtered.plotSoFar.length).toBe(13);

      const hasFinale = filtered.plotSoFar.some((p: any) => p.episode === 62);
      expect(hasFinale).toBe(true);
    });
  });

  describe('knowledgeToPrompt', () => {
    it('should generate prompt with characters and relationships', () => {
      const drama = findDramaKnowledge('繁花')!;
      const filtered = filterKnowledgeByEpisode(drama, 5);
      const prompt = knowledgeToPrompt(filtered);

      expect(prompt).toContain('阿宝');
      expect(prompt).toContain('胡歌');
      expect(prompt).toContain('角色关系');
      expect(prompt).toContain('不要透露之后的剧情');
    });

    it('should include plot summary up to current episode', () => {
      const drama = findDramaKnowledge('漫长的季节')!;
      const filtered = filterKnowledgeByEpisode(drama, 6);
      const prompt = knowledgeToPrompt(filtered);

      expect(prompt).toContain('碎尸案浮出水面');
      expect(prompt).not.toContain('大结局');
    });

    it('should generate Breaking Bad prompt with Heisenberg alias', () => {
      const drama = findDramaKnowledge('绝命毒师')!;
      const filtered = filterKnowledgeByEpisode(drama, 20);
      const prompt = knowledgeToPrompt(filtered);

      expect(prompt).toContain('Walter White');
      expect(prompt).toContain('Heisenberg');
      expect(prompt).toContain('Bryan Cranston');
      expect(prompt).toContain('Gustavo Fring');
      expect(prompt).not.toContain('Todd Alquist');
    });
  });
});
