/**
 * 宠物进化系统类型定义
 *
 * 设计理念：
 * - 千人千面：每个用户的宠物由 seed + 互动行为决定外观
 * - 进化系统：经验值升级 → 解锁新形态/配件/表情
 * - 情感绑定：宠物会根据互动频率、情绪状态变化
 */

/** 宠物物种（基础形态） */
export type PetSpecies =
  | 'blob'       // 果冻球（默认）
  | 'cat'        // 猫咪
  | 'fox'        // 狐狸
  | 'owl'        // 猫头鹰
  | 'dragon'     // 小龙
  | 'ghost';     // 幽灵

/** 进化阶段 */
export type EvolutionStage =
  | 'egg'        // Lv 0: 蛋
  | 'baby'       // Lv 1-5: 幼年
  | 'teen'       // Lv 6-15: 少年
  | 'adult'      // Lv 16-30: 成年
  | 'elder'      // Lv 31+: 长老
  | 'legendary'; // Lv 50+: 传说

/** 宠物情绪状态 */
export type PetMood =
  | 'happy'      // 开心
  | 'excited'    // 兴奋
  | 'thinking'   // 思考中
  | 'sleepy'     // 困了
  | 'sad'        // 难过
  | 'angry'      // 生气
  | 'shocked'    // 震惊
  | 'love'       // 心动
  | 'neutral';   // 平静

/** 表情动画 ID */
export type PetExpression =
  | 'idle'
  | 'blink'
  | 'talk'
  | 'laugh'
  | 'cry'
  | 'gasp'
  | 'heart-eyes'
  | 'rage'
  | 'sleep'
  | 'sparkle'
  | 'bounce';

/** 配件/装饰 */
export interface PetAccessory {
  id: string;
  name: string;
  category: 'hat' | 'glasses' | 'scarf' | 'badge' | 'effect';
  /** 解锁条件 */
  unlockCondition: UnlockCondition;
  /** CSS 位置偏移 */
  position: { top: number; left: number };
  emoji: string; // 用 emoji 作为简易图形
}

export type UnlockCondition =
  | { type: 'level'; level: number }
  | { type: 'watchHours'; hours: number }
  | { type: 'genre'; genre: string; count: number }
  | { type: 'streak'; days: number }
  | { type: 'special'; id: string };

/** 宠物颜色主题（千人千面核心） */
export interface PetColorTheme {
  primary: string;      // 主体色
  secondary: string;    // 辅助色
  accent: string;       // 高亮色
  eye: string;          // 眼睛色
}

/** 宠物完整状态 */
export interface PetState {
  id: string;
  name: string;                // 用户给的名字
  species: PetSpecies;
  stage: EvolutionStage;
  level: number;
  exp: number;
  expToNext: number;
  mood: PetMood;
  colorTheme: PetColorTheme;
  accessories: string[];       // 已装备配件 ID
  unlockedAccessories: string[];
  /** 看剧统计 */
  stats: PetStats;
  /** 创建时间 */
  createdAt: number;
  /** 上次互动时间 */
  lastInteraction: number;
}

export interface PetStats {
  totalMessages: number;       // 总对话数
  totalWatchMinutes: number;   // 总观看时长
  dramasWatched: number;       // 看过几部剧
  favoriteGenre: string;       // 最爱类型
  longestStreak: number;       // 最长连续天数
  currentStreak: number;       // 当前连续天数
}

/** 经验值事件 */
export interface ExpEvent {
  type: ExpEventType;
  amount: number;
  timestamp: number;
}

export type ExpEventType =
  | 'send_message'      // +5
  | 'receive_reply'     // +3
  | 'watch_10min'       // +10
  | 'daily_login'       // +20
  | 'finish_episode'    // +30
  | 'new_drama'         // +50
  | 'streak_bonus'      // +streak*10
  | 'ocr_capture'       // +8
  | 'voice_input';      // +8

/** 进化配置 */
export interface EvolutionConfig {
  stage: EvolutionStage;
  minLevel: number;
  features: string[];     // 该阶段解锁的功能描述
}

/** 进化路线 */
export const EVOLUTION_STAGES: EvolutionConfig[] = [
  { stage: 'egg', minLevel: 0, features: ['静态显示'] },
  { stage: 'baby', minLevel: 1, features: ['基础表情', '眨眼动画'] },
  { stage: 'teen', minLevel: 6, features: ['情绪响应', '配件系统', '3种表情'] },
  { stage: 'adult', minLevel: 16, features: ['全部表情', '颜色渐变', '特效动画'] },
  { stage: 'elder', minLevel: 31, features: ['稀有配件', '光环效果', '自定义颜色'] },
  { stage: 'legendary', minLevel: 50, features: ['传说皮肤', '粒子特效', '称号'] },
];
