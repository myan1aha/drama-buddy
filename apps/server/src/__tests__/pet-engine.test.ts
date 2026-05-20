import {
  createPet,
  addExp,
  inferMoodFromMessage,
  generateColorTheme,
  randomSpecies,
  getIdleMood,
  checkUnlockableAccessories,
} from '../lib/pet/engine';

describe('Pet Engine', () => {
  describe('createPet', () => {
    it('should create a pet with egg stage and level 0', () => {
      const pet = createPet('user123', '小花');
      expect(pet.name).toBe('小花');
      expect(pet.stage).toBe('egg');
      expect(pet.level).toBe(0);
      expect(pet.exp).toBe(0);
      expect(pet.mood).toBe('neutral');
      expect(pet.accessories).toEqual([]);
      expect(pet.colorTheme.primary).toContain('hsl');
    });

    it('should use specified species when provided', () => {
      const pet = createPet('user123', 'Neko', 'cat');
      expect(pet.species).toBe('cat');
    });

    it('should generate deterministic species from seed', () => {
      const pet1 = createPet('user_abc', '团子');
      const pet2 = createPet('user_abc', '球球');
      expect(pet1.species).toBe(pet2.species);
    });
  });

  describe('addExp', () => {
    it('should add experience points', () => {
      const pet = createPet('user1', '测试');
      const result = addExp(pet, 'send_message');
      expect(result.pet.exp).toBe(5);
      expect(result.leveledUp).toBe(false);
    });

    it('should level up when enough exp', () => {
      const pet = createPet('user1', '测试');
      // level 0 需要 100 exp
      const result = addExp(pet, 'daily_login', 5); // 20*5 = 100
      expect(result.pet.level).toBe(1);
      expect(result.leveledUp).toBe(true);
      expect(result.pet.stage).toBe('baby');
      expect(result.evolved).toBe(true);
      expect(result.newStage).toBe('baby');
    });

    it('should handle multi-level jumps', () => {
      const pet = createPet('user1', '测试');
      // 给超多经验
      const result = addExp(pet, 'new_drama', 100); // 50*100 = 5000
      expect(result.pet.level).toBeGreaterThan(5);
      expect(result.leveledUp).toBe(true);
    });

    it('should apply multiplier', () => {
      const pet = createPet('user1', '测试');
      const result = addExp(pet, 'streak_bonus', 7); // 10*7 = 70
      expect(result.pet.exp).toBe(70);
    });
  });

  describe('inferMoodFromMessage', () => {
    it('should detect sadness', () => {
      expect(inferMoodFromMessage('太难过了😭')).toBe('sad');
    });

    it('should detect anger', () => {
      expect(inferMoodFromMessage('气死我了😡')).toBe('angry');
    });

    it('should detect love', () => {
      expect(inferMoodFromMessage('好磕啊❤️')).toBe('love');
    });

    it('should detect happiness', () => {
      expect(inferMoodFromMessage('哈哈哈绝了')).toBe('happy');
    });

    it('should detect shock', () => {
      expect(inferMoodFromMessage('我靠😱不会吧')).toBe('shocked');
    });

    it('should default to neutral', () => {
      expect(inferMoodFromMessage('你好')).toBe('neutral');
    });
  });

  describe('generateColorTheme', () => {
    it('should generate consistent colors for same seed', () => {
      const theme1 = generateColorTheme('user_seed_123');
      const theme2 = generateColorTheme('user_seed_123');
      expect(theme1).toEqual(theme2);
    });

    it('should generate different colors for different seeds', () => {
      const theme1 = generateColorTheme('alice');
      const theme2 = generateColorTheme('bob');
      expect(theme1.primary).not.toBe(theme2.primary);
    });
  });

  describe('randomSpecies', () => {
    it('should be deterministic', () => {
      expect(randomSpecies('xyz')).toBe(randomSpecies('xyz'));
    });

    it('should return valid species', () => {
      const valid = ['blob', 'cat', 'fox', 'owl', 'dragon', 'ghost'];
      expect(valid).toContain(randomSpecies('test_user'));
    });
  });

  describe('getIdleMood', () => {
    it('should return neutral for recent interaction', () => {
      expect(getIdleMood(Date.now() - 1000 * 60 * 30)).toBe('neutral');
    });

    it('should return sleepy for 12+ hours', () => {
      expect(getIdleMood(Date.now() - 1000 * 60 * 60 * 13)).toBe('sleepy');
    });

    it('should return sad for 48+ hours', () => {
      expect(getIdleMood(Date.now() - 1000 * 60 * 60 * 50)).toBe('sad');
    });
  });

  describe('checkUnlockableAccessories', () => {
    it('should unlock party hat at level 3', () => {
      const pet = createPet('user1', '测试');
      // Manually set level
      const leveledPet = { ...pet, level: 3 };
      const unlockable = checkUnlockableAccessories(leveledPet);
      const ids = unlockable.map((a) => a.id);
      expect(ids).toContain('hat-party');
    });

    it('should not unlock already owned accessories', () => {
      const pet = createPet('user1', '测试');
      const leveledPet = { ...pet, level: 5, unlockedAccessories: ['hat-party'] };
      const unlockable = checkUnlockableAccessories(leveledPet);
      const ids = unlockable.map((a) => a.id);
      expect(ids).not.toContain('hat-party');
      expect(ids).toContain('glasses-cool'); // level 5 unlocks glasses
    });
  });
});
