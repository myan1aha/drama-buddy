import type {
  PetState,
  PetSpecies,
  EvolutionStage,
  PetMood,
  PetColorTheme,
  ExpEventType,
  PetAccessory,
  EVOLUTION_STAGES,
} from '@drama-buddy/shared/pet';

/** 经验值表 */
const EXP_TABLE: Record<ExpEventType, number> = {
  send_message: 5,
  receive_reply: 3,
  watch_10min: 10,
  daily_login: 20,
  finish_episode: 30,
  new_drama: 50,
  streak_bonus: 10, // 乘以连续天数
  ocr_capture: 8,
  voice_input: 8,
};

/** 升级所需经验公式: level * 50 + 100 */
function expRequired(level: number): number {
  return level * 50 + 100;
}

/** 根据 level 确定进化阶段 */
function getStageForLevel(level: number): EvolutionStage {
  if (level >= 50) return 'legendary';
  if (level >= 31) return 'elder';
  if (level >= 16) return 'adult';
  if (level >= 6) return 'teen';
  if (level >= 1) return 'baby';
  return 'egg';
}

/**
 * 千人千面：根据 seed 生成唯一颜色主题
 * seed 可以是 userId 的 hash
 */
export function generateColorTheme(seed: string): PetColorTheme {
  // Simple hash → hue
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }

  const hue = Math.abs(hash % 360);
  const hue2 = (hue + 30) % 360;
  const hue3 = (hue + 180) % 360;

  return {
    primary: `hsl(${hue}, 70%, 60%)`,
    secondary: `hsl(${hue2}, 60%, 45%)`,
    accent: `hsl(${hue3}, 80%, 65%)`,
    eye: `hsl(${hue}, 90%, 30%)`,
  };
}

/**
 * 根据物种+seed 随机选择初始物种
 */
export function randomSpecies(seed: string): PetSpecies {
  const species: PetSpecies[] = ['blob', 'cat', 'fox', 'owl', 'dragon', 'ghost'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return species[Math.abs(hash) % species.length];
}

/**
 * 创建新宠物
 */
export function createPet(userId: string, name: string, species?: PetSpecies): PetState {
  const chosenSpecies = species || randomSpecies(userId);
  const colorTheme = generateColorTheme(userId);

  return {
    id: `pet_${userId}_${Date.now()}`,
    name,
    species: chosenSpecies,
    stage: 'egg',
    level: 0,
    exp: 0,
    expToNext: expRequired(0),
    mood: 'neutral',
    colorTheme,
    accessories: [],
    unlockedAccessories: [],
    stats: {
      totalMessages: 0,
      totalWatchMinutes: 0,
      dramasWatched: 0,
      favoriteGenre: '',
      longestStreak: 0,
      currentStreak: 0,
    },
    createdAt: Date.now(),
    lastInteraction: Date.now(),
  };
}

/**
 * 增加经验值 + 自动升级/进化
 */
export function addExp(
  pet: PetState,
  eventType: ExpEventType,
  multiplier = 1
): { pet: PetState; leveledUp: boolean; evolved: boolean; newStage?: EvolutionStage } {
  const baseExp = EXP_TABLE[eventType] || 5;
  const gainedExp = baseExp * multiplier;

  let { exp, level, stage } = pet;
  exp += gainedExp;

  let leveledUp = false;
  let evolved = false;
  let newStage: EvolutionStage | undefined;

  // 循环升级（可能一次加很多经验跳多级）
  while (exp >= expRequired(level)) {
    exp -= expRequired(level);
    level += 1;
    leveledUp = true;

    const nextStage = getStageForLevel(level);
    if (nextStage !== stage) {
      stage = nextStage;
      evolved = true;
      newStage = nextStage;
    }
  }

  return {
    pet: {
      ...pet,
      exp,
      level,
      stage,
      expToNext: expRequired(level),
      lastInteraction: Date.now(),
    },
    leveledUp,
    evolved,
    newStage,
  };
}

/**
 * 根据消息内容推断宠物情绪
 */
export function inferMoodFromMessage(content: string): PetMood {
  const lower = content.toLowerCase();

  if (/哭|😭|难过|心疼|泪|呜/.test(lower)) return 'sad';
  if (/气|😡|愤怒|生气|讨厌|垃圾/.test(lower)) return 'angry';
  if (/震惊|💀|😱|不会吧|我靠|卧槽/.test(lower)) return 'shocked';
  if (/❤️|嗑|甜|心动|好磕|在一起/.test(lower)) return 'love';
  if (/哈哈|🔥|绝了|笑|有趣|好玩/.test(lower)) return 'happy';
  if (/🤔|为什么|为啥|想|分析|思考/.test(lower)) return 'thinking';
  if (/兴奋|太好了|冲|牛|Amazing/.test(lower)) return 'excited';

  return 'neutral';
}

/**
 * 根据离线时长计算宠物状态
 */
export function getIdleMood(lastInteraction: number): PetMood {
  const hoursAgo = (Date.now() - lastInteraction) / (1000 * 60 * 60);
  if (hoursAgo > 48) return 'sad';
  if (hoursAgo > 12) return 'sleepy';
  return 'neutral';
}

/**
 * 可用配件列表
 */
export const ALL_ACCESSORIES: PetAccessory[] = [
  // 帽子
  { id: 'hat-party', name: '派对帽', category: 'hat', unlockCondition: { type: 'level', level: 3 }, position: { top: -15, left: 0 }, emoji: '🎉' },
  { id: 'hat-crown', name: '皇冠', category: 'hat', unlockCondition: { type: 'level', level: 20 }, position: { top: -18, left: 0 }, emoji: '👑' },
  { id: 'hat-wizard', name: '巫师帽', category: 'hat', unlockCondition: { type: 'level', level: 35 }, position: { top: -20, left: -2 }, emoji: '🧙' },

  // 眼镜
  { id: 'glasses-cool', name: '墨镜', category: 'glasses', unlockCondition: { type: 'level', level: 5 }, position: { top: 2, left: 0 }, emoji: '🕶️' },
  { id: 'glasses-nerd', name: '书呆子眼镜', category: 'glasses', unlockCondition: { type: 'watchHours', hours: 10 }, position: { top: 2, left: 0 }, emoji: '🤓' },

  // 围巾
  { id: 'scarf-red', name: '红围巾', category: 'scarf', unlockCondition: { type: 'streak', days: 7 }, position: { top: 18, left: 0 }, emoji: '🧣' },

  // 徽章
  { id: 'badge-drama', name: '追剧达人', category: 'badge', unlockCondition: { type: 'genre', genre: '悬疑', count: 3 }, position: { top: 10, left: 15 }, emoji: '🎬' },
  { id: 'badge-night', name: '夜猫子', category: 'badge', unlockCondition: { type: 'watchHours', hours: 50 }, position: { top: 10, left: 15 }, emoji: '🦉' },
  { id: 'badge-legend', name: '传说', category: 'badge', unlockCondition: { type: 'level', level: 50 }, position: { top: 10, left: 15 }, emoji: '⭐' },

  // 特效
  { id: 'effect-sparkle', name: '闪闪发光', category: 'effect', unlockCondition: { type: 'level', level: 10 }, position: { top: 0, left: 0 }, emoji: '✨' },
  { id: 'effect-fire', name: '燃烧', category: 'effect', unlockCondition: { type: 'level', level: 25 }, position: { top: 0, left: 0 }, emoji: '🔥' },
  { id: 'effect-rainbow', name: '彩虹', category: 'effect', unlockCondition: { type: 'level', level: 40 }, position: { top: -20, left: 0 }, emoji: '🌈' },
];

/**
 * 检查哪些配件可以解锁
 */
export function checkUnlockableAccessories(pet: PetState): PetAccessory[] {
  return ALL_ACCESSORIES.filter((acc) => {
    if (pet.unlockedAccessories.includes(acc.id)) return false;

    const cond = acc.unlockCondition;
    switch (cond.type) {
      case 'level':
        return pet.level >= cond.level;
      case 'watchHours':
        return pet.stats.totalWatchMinutes / 60 >= cond.hours;
      case 'streak':
        return pet.stats.longestStreak >= cond.days;
      case 'genre':
        return false; // 需要外部数据，简化处理
      default:
        return false;
    }
  });
}
