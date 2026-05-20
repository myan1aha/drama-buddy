import { NextRequest } from 'next/server';
import {
  createPet,
  addExp,
  inferMoodFromMessage,
  checkUnlockableAccessories,
  getIdleMood,
  ALL_ACCESSORIES,
} from '@/lib/pet/engine';
import { getPet, savePet } from '@/lib/db';
import type { PetState, ExpEventType, PetSpecies } from '@drama-buddy/shared/pet';

export const runtime = 'nodejs';

/**
 * GET /api/pet?userId=xxx — 获取用户宠物状态
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return Response.json({ error: '缺少 userId 参数' }, { status: 400 });
  }

  const pet = getPet(userId);
  if (!pet) {
    return Response.json({ exists: false, message: '尚未创建宠物' });
  }

  // 根据离线时长调整情绪
  const idleMood = getIdleMood(pet.lastInteraction);
  const currentPet = { ...pet, mood: idleMood !== 'neutral' ? idleMood : pet.mood };

  // 检查新可解锁配件
  const unlockable = checkUnlockableAccessories(currentPet);

  return Response.json({
    exists: true,
    pet: currentPet,
    unlockable: unlockable.map((a) => ({ id: a.id, name: a.name, emoji: a.emoji })),
  });
}

/**
 * POST /api/pet — 宠物操作
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId } = body;

    if (!action || !userId) {
      return Response.json({ error: '缺少 action 或 userId' }, { status: 400 });
    }

    switch (action) {
      case 'create': {
        if (getPet(userId)) {
          return Response.json({ error: '已有宠物，不能重复创建' }, { status: 409 });
        }
        const { name, species } = body as { name: string; species?: PetSpecies };
        if (!name) {
          return Response.json({ error: '缺少宠物名字' }, { status: 400 });
        }
        const pet = createPet(userId, name, species);
        savePet(userId, pet);
        return Response.json({ success: true, pet });
      }

      case 'addExp': {
        const pet = getPet(userId);
        if (!pet) {
          return Response.json({ error: '宠物不存在' }, { status: 404 });
        }
        const { eventType, multiplier } = body as {
          eventType: ExpEventType;
          multiplier?: number;
        };
        const result = addExp(pet, eventType, multiplier);

        // 检查升级后是否解锁新配件
        const newUnlocks = checkUnlockableAccessories(result.pet);
        if (newUnlocks.length > 0) {
          result.pet.unlockedAccessories.push(...newUnlocks.map((a) => a.id));
        }

        savePet(userId, result.pet);

        return Response.json({
          success: true,
          pet: result.pet,
          leveledUp: result.leveledUp,
          evolved: result.evolved,
          newStage: result.newStage,
          newUnlocks: newUnlocks.map((a) => ({ id: a.id, name: a.name, emoji: a.emoji })),
        });
      }

      case 'updateMood': {
        const pet = getPet(userId);
        if (!pet) {
          return Response.json({ error: '宠物不存在' }, { status: 404 });
        }
        const { message } = body as { message: string };
        const mood = inferMoodFromMessage(message || '');
        const updated = { ...pet, mood, lastInteraction: Date.now() };
        savePet(userId, updated);
        return Response.json({ success: true, pet: updated });
      }

      case 'equip': {
        const pet = getPet(userId);
        if (!pet) {
          return Response.json({ error: '宠物不存在' }, { status: 404 });
        }
        const { accessoryId } = body as { accessoryId: string };
        if (!pet.unlockedAccessories.includes(accessoryId)) {
          return Response.json({ error: '配件尚未解锁' }, { status: 403 });
        }
        const acc = ALL_ACCESSORIES.find((a) => a.id === accessoryId);
        if (!acc) {
          return Response.json({ error: '配件不存在' }, { status: 404 });
        }
        const filtered = pet.accessories.filter((id) => {
          const existing = ALL_ACCESSORIES.find((a) => a.id === id);
          return existing?.category !== acc.category;
        });
        filtered.push(accessoryId);
        const updated = { ...pet, accessories: filtered };
        savePet(userId, updated);
        return Response.json({ success: true, pet: updated });
      }

      case 'unequip': {
        const pet = getPet(userId);
        if (!pet) {
          return Response.json({ error: '宠物不存在' }, { status: 404 });
        }
        const { accessoryId } = body as { accessoryId: string };
        const updated = {
          ...pet,
          accessories: pet.accessories.filter((id) => id !== accessoryId),
        };
        savePet(userId, updated);
        return Response.json({ success: true, pet: updated });
      }

      case 'unlock': {
        const pet = getPet(userId);
        if (!pet) {
          return Response.json({ error: '宠物不存在' }, { status: 404 });
        }
        const { accessoryId } = body as { accessoryId: string };
        const unlockable = checkUnlockableAccessories(pet);
        const canUnlock = unlockable.find((a) => a.id === accessoryId);
        if (!canUnlock) {
          return Response.json({ error: '不满足解锁条件' }, { status: 403 });
        }
        pet.unlockedAccessories.push(accessoryId);
        savePet(userId, pet);
        return Response.json({
          success: true,
          pet,
          unlocked: { id: canUnlock.id, name: canUnlock.name, emoji: canUnlock.emoji },
        });
      }

      default:
        return Response.json({ error: `未知操作: ${action}` }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: '请求解析失败' }, { status: 400 });
  }
}
