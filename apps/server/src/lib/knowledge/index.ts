import type { DramaKnowledge, FilteredKnowledge, Character, Relationship, PlotPoint } from '@drama-buddy/shared/knowledge';
import { fanhua } from './fanhua';
import { kuangbiao } from './kuangbiao';
import { manchangdejijie } from './manchangdejijie';
import { breakingbad } from './breakingbad';
import { gameofthrones } from './gameofthrones';
import { bettercallsaul } from './bettercallsaul';

/** 内置知识库注册表 */
const BUILTIN_REGISTRY: DramaKnowledge[] = [
  breakingbad,
  bettercallsaul,
  gameofthrones,
  fanhua,
  kuangbiao,
  manchangdejijie,
];

/** 用户自定义知识库（运行时动态添加） */
let customRegistry: DramaKnowledge[] = [];

/**
 * 根据剧名模糊匹配知识库
 */
export function findDramaKnowledge(title: string): DramaKnowledge | null {
  const normalized = title.trim().toLowerCase();

  const allDramas = [...BUILTIN_REGISTRY, ...customRegistry];

  for (const drama of allDramas) {
    // 精确匹配
    if (drama.title.toLowerCase() === normalized) return drama;
    // 别名匹配
    if (drama.aliases?.some((a) => a.toLowerCase() === normalized)) return drama;
  }

  // 模糊匹配（包含关系）
  for (const drama of allDramas) {
    if (drama.title.toLowerCase().includes(normalized) || normalized.includes(drama.title.toLowerCase())) {
      return drama;
    }
    if (drama.aliases?.some((a) => a.toLowerCase().includes(normalized) || normalized.includes(a.toLowerCase()))) {
      return drama;
    }
  }

  return null;
}

/**
 * 通用剧集 fallback — 当知识库中没有匹配时，生成一个最小化知识结构
 * 让 AI 仍然可以基于剧名提供基本防剧透和陪看能力
 */
export function createGenericFallback(title: string, episode?: number): FilteredKnowledge {
  return {
    title,
    currentEpisode: episode || 1,
    characters: [],
    relationships: [],
    plotSoFar: [],
  };
}

/**
 * 生成通用剧集 fallback prompt
 */
export function genericFallbackPrompt(title: string, episode?: number): string {
  const ep = episode || '未知';
  return [
    '',
    `=== 通用模式：《${title}》（第${ep}集）===`,
    '',
    '当前没有该剧的结构化知识库。请遵循以下原则：',
    `1. 你是用户的追剧伙伴，正在陪 ta 看《${title}》第${ep}集`,
    '2. 绝对不要剧透用户尚未看到的内容',
    '3. 如果用户问到你不确定的剧情，诚实说"我不太确定这个细节"',
    '4. 可以基于用户描述的情节进行讨论、分析角色动机、预测走向',
    '5. 保持轻松有趣的聊天氛围，像朋友一起看剧一样',
    '6. 如果用户提到的角色或情节你完全不了解，引导用户多描述一些',
    '',
  ].join('\n');
}

/**
 * 根据当前集数过滤知识（防剧透核心逻辑）
 */
export function filterKnowledgeByEpisode(
  knowledge: DramaKnowledge,
  currentEpisode: number
): FilteredKnowledge {
  // 过滤角色：只返回已出场的
  const characters: Character[] = knowledge.characters.filter(
    (c) => !c.firstAppearance || c.firstAppearance <= currentEpisode
  );

  // 过滤关系：只返回已揭示的
  const relationships: Relationship[] = knowledge.relationships.filter(
    (r) => !r.revealedAt || r.revealedAt <= currentEpisode
  );

  // 过滤剧情：只返回已播出集的
  const plotSoFar: PlotPoint[] = (knowledge.plotPoints || []).filter(
    (p) => p.episode <= currentEpisode
  );

  return {
    title: knowledge.title,
    currentEpisode,
    characters,
    relationships,
    plotSoFar,
  };
}

/**
 * 将知识库转为 system prompt 片段
 */
export function knowledgeToPrompt(filtered: FilteredKnowledge): string {
  const lines: string[] = [
    '',
    `=== 《${filtered.title}》角色知识库（截至第${filtered.currentEpisode}集）===`,
    '',
  ];

  // 角色信息
  if (filtered.characters.length > 0) {
    lines.push('【主要角色】');
    for (const c of filtered.characters) {
      const actor = c.actor ? `（${c.actor} 饰）` : '';
      const aliases = c.aliases?.length ? `，又称${c.aliases.join('/')}` : '';
      lines.push(`- ${c.name}${actor}${aliases}：${c.description}`);
      if (c.personality) {
        lines.push(`  性格：${c.personality}`);
      }
    }
    lines.push('');
  }

  // 关系
  if (filtered.relationships.length > 0) {
    lines.push('【角色关系】');
    const typeLabels: Record<string, string> = {
      couple: '恋人/伴侣',
      ex: '前任',
      family: '家人',
      friend: '朋友',
      rival: '对手',
      colleague: '同事',
      mentor: '师徒',
      enemy: '敌对',
      secret: '隐秘关系',
      other: '其他',
    };
    for (const r of filtered.relationships) {
      const label = typeLabels[r.type] || r.type;
      const desc = r.description ? `（${r.description}）` : '';
      lines.push(`- ${r.from} ↔ ${r.to}：${label}${desc}`);
    }
    lines.push('');
  }

  // 已知剧情
  if (filtered.plotSoFar.length > 0) {
    lines.push('【已知剧情梗概】');
    for (const p of filtered.plotSoFar) {
      lines.push(`- 第${p.episode}集：${p.summary}`);
    }
    lines.push('');
  }

  lines.push('注意：以上是用户已看到的内容，不要透露之后的剧情和尚未出场的角色！');

  return lines.join('\n');
}

/**
 * 添加自定义剧集知识
 */
export function addCustomKnowledge(knowledge: DramaKnowledge): void {
  // 去重
  customRegistry = customRegistry.filter((k) => k.id !== knowledge.id);
  customRegistry.push(knowledge);
}

/**
 * 获取所有可用剧集列表
 */
export function listAvailableDramas(): { id: string; title: string; episodes: number }[] {
  return [...BUILTIN_REGISTRY, ...customRegistry].map((d) => ({
    id: d.id,
    title: d.title,
    episodes: d.totalEpisodes,
  }));
}
