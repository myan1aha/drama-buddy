import { useState, useEffect, useCallback, useRef } from 'react';
import type { PetState, PetSpecies, ExpEventType, PetMood, EvolutionStage } from '../pet/types';

const STORAGE_KEY = 'drama-buddy-pet';

interface UsePetOptions {
  userId: string;
  serverUrl?: string;
  autoSync?: boolean;
}

interface PetExpResult {
  leveledUp: boolean;
  evolved: boolean;
  newStage?: string;
  newUnlocks: { id: string; name: string; emoji: string }[];
}

interface PetHookResult {
  pet: PetState | null;
  loading: boolean;
  error: string | null;
  createPet: (name: string, species?: PetSpecies) => Promise<void>;
  addExp: (eventType: ExpEventType, multiplier?: number) => Promise<PetExpResult | null>;
  updateMood: (message: string) => void;
  equipAccessory: (accessoryId: string) => Promise<void>;
  unequipAccessory: (accessoryId: string) => Promise<void>;
  unlockAccessory: (accessoryId: string) => Promise<void>;
}

/**
 * 宠物状态管理 Hook（离线优先 + 可选服务端同步）
 */
export function usePet({ userId, serverUrl, autoSync = false }: UsePetOptions): PetHookResult {
  const apiBase = serverUrl || '';

  const [pet, setPet] = useState<PetState | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id?.includes(userId)) return parsed;
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 持久化
  useEffect(() => {
    if (pet) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pet));
    }
  }, [pet]);

  // 初始加载（autoSync 模式）
  useEffect(() => {
    if (autoSync && userId && !pet && apiBase) {
      fetchFromServer();
    }
  }, [userId, autoSync]);

  const fetchFromServer = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/pet?userId=${userId}`);
      const data = await res.json();
      if (data.exists && data.pet) setPet(data.pet);
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  const apiCall = async (body: object) => {
    if (!apiBase) return null;
    try {
      const res = await fetch(`${apiBase}/api/pet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch {
      return null;
    }
  };

  const createPet = useCallback(async (name: string, species?: PetSpecies) => {
    setLoading(true);
    const localPet: PetState = {
      id: `pet_${userId}_${Date.now()}`,
      name,
      species: species || randomSpecies(userId),
      stage: 'egg',
      level: 0,
      exp: 0,
      expToNext: 100,
      mood: 'neutral',
      colorTheme: generateColorTheme(userId),
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
    setPet(localPet);
    if (autoSync) {
      const res = await apiCall({ action: 'create', userId, name, species });
      if (res?.pet) setPet(res.pet);
    }
    setLoading(false);
  }, [userId, autoSync]);

  const addExpFn = useCallback(async (eventType: ExpEventType, multiplier = 1): Promise<PetExpResult | null> => {
    if (!pet) return null;
    const result = localAddExp(pet, eventType, multiplier);
    setPet(result.pet);
    if (autoSync) apiCall({ action: 'addExp', userId, eventType, multiplier });
    return { leveledUp: result.leveledUp, evolved: result.evolved, newStage: result.newStage, newUnlocks: [] };
  }, [pet, userId, autoSync]);

  const updateMood = useCallback((message: string) => {
    if (!pet) return;
    const mood = inferMood(message);
    setPet((p) => p ? { ...p, mood, lastInteraction: Date.now() } : null);
  }, [pet]);

  const equipAccessory = useCallback(async (accessoryId: string) => {
    if (!pet || !pet.unlockedAccessories.includes(accessoryId)) return;
    const category = ACCESSORY_CATEGORIES[accessoryId];
    const newAcc = [...pet.accessories.filter((id) => ACCESSORY_CATEGORIES[id] !== category), accessoryId];
    setPet({ ...pet, accessories: newAcc });
    if (autoSync) apiCall({ action: 'equip', userId, accessoryId });
  }, [pet, userId, autoSync]);

  const unequipAccessory = useCallback(async (accessoryId: string) => {
    if (!pet) return;
    setPet({ ...pet, accessories: pet.accessories.filter((id) => id !== accessoryId) });
    if (autoSync) apiCall({ action: 'unequip', userId, accessoryId });
  }, [pet, userId, autoSync]);

  const unlockAccessory = useCallback(async (accessoryId: string) => {
    if (!pet || pet.unlockedAccessories.includes(accessoryId)) return;
    setPet({ ...pet, unlockedAccessories: [...pet.unlockedAccessories, accessoryId] });
    if (autoSync) apiCall({ action: 'unlock', userId, accessoryId });
  }, [pet, userId, autoSync]);

  return { pet, loading, error, createPet, addExp: addExpFn, updateMood, equipAccessory, unequipAccessory, unlockAccessory };
}

/* === 本地工具函数 === */
const EXP_TABLE: Record<string, number> = {
  send_message: 5, receive_reply: 3, watch_10min: 10, daily_login: 20,
  finish_episode: 30, new_drama: 50, streak_bonus: 10, ocr_capture: 8, voice_input: 8,
};

function localAddExp(pet: PetState, eventType: ExpEventType, multiplier: number) {
  const baseExp = EXP_TABLE[eventType] || 5;
  let { exp, level, stage } = pet;
  exp += baseExp * multiplier;
  let leveledUp = false, evolved = false;
  let newStage: string | undefined;

  while (exp >= level * 50 + 100) {
    exp -= level * 50 + 100;
    level += 1;
    leveledUp = true;
    const next = getStage(level);
    if (next !== stage) { stage = next; evolved = true; newStage = next; }
  }

  return {
    pet: { ...pet, exp, level, stage, expToNext: level * 50 + 100, lastInteraction: Date.now() } as PetState,
    leveledUp, evolved, newStage,
  };
}

function getStage(level: number): EvolutionStage {
  if (level >= 50) return 'legendary';
  if (level >= 31) return 'elder';
  if (level >= 16) return 'adult';
  if (level >= 6) return 'teen';
  if (level >= 1) return 'baby';
  return 'egg';
}

function inferMood(content: string): PetMood {
  const l = content.toLowerCase();
  if (/哭|😭|难过|心疼|泪|呜/.test(l)) return 'sad';
  if (/气|😡|愤怒|生气|讨厌|垃圾/.test(l)) return 'angry';
  if (/震惊|💀|😱|不会吧|我靠|卧槽/.test(l)) return 'shocked';
  if (/❤️|嗑|甜|心动|好磕|在一起/.test(l)) return 'love';
  if (/哈哈|🔥|绝了|笑|有趣|好玩/.test(l)) return 'happy';
  if (/🤔|为什么|为啥|想|分析|思考/.test(l)) return 'thinking';
  if (/兴奋|太好了|冲|牛|Amazing/.test(l)) return 'excited';
  return 'neutral';
}

function randomSpecies(seed: string): PetSpecies {
  const list: PetSpecies[] = ['blob', 'cat', 'fox', 'owl', 'dragon', 'ghost'];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

function generateColorTheme(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  const hue = Math.abs(h % 360);
  return {
    primary: `hsl(${hue}, 70%, 60%)`,
    secondary: `hsl(${(hue + 30) % 360}, 60%, 45%)`,
    accent: `hsl(${(hue + 180) % 360}, 80%, 65%)`,
    eye: `hsl(${hue}, 90%, 30%)`,
  };
}

const ACCESSORY_CATEGORIES: Record<string, string> = {
  'hat-party': 'hat', 'hat-crown': 'hat', 'hat-wizard': 'hat',
  'glasses-cool': 'glasses', 'glasses-nerd': 'glasses', 'scarf-red': 'scarf',
  'badge-drama': 'badge', 'badge-night': 'badge', 'badge-legend': 'badge',
  'effect-sparkle': 'effect', 'effect-fire': 'effect', 'effect-rainbow': 'effect',
};
