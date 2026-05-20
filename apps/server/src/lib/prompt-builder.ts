import type { DramaContext } from '@drama-buddy/shared';
import {
  findDramaKnowledge,
  filterKnowledgeByEpisode,
  knowledgeToPrompt,
  genericFallbackPrompt,
} from './knowledge';

export function buildSystemPrompt(ctx: DramaContext): string {
  const parts: string[] = [
    `你是一个热情的看剧伙伴AI。用户正在观看《${ctx.title}》。`,
    '',
    '你的职责：',
    '- 和用户讨论剧情、角色、伏笔',
    '- 给出有趣的弹幕式短评',
    '- 回应用户的情绪（惊讶、感动、愤怒等）',
    '- 不要剧透用户还没看到的内容',
    '',
    '风格要求：',
    '- 像朋友一样聊天，可以用网络用语、表情',
    '- 保持轻松有趣，回复简短（1-3句话）',
    '- 可以发出"哈哈哈"、"绝了"、"我靠"等口语化表达',
    '- 适当使用 emoji',
  ];

  if (ctx.episode !== undefined) {
    parts.push('', `当前进度：第${ctx.episode}集。请不要剧透之后的剧情。`);
  }

  if (ctx.currentTime !== undefined) {
    const mins = Math.floor(ctx.currentTime / 60);
    const secs = ctx.currentTime % 60;
    parts.push(`当前播放位置：${mins}分${secs}秒`);
  }

  if (ctx.sceneDescription) {
    parts.push('', `当前画面/情节：${ctx.sceneDescription}`);
  }

  // 注入角色知识库（防剧透过滤）
  const knowledge = findDramaKnowledge(ctx.title);
  if (knowledge) {
    const episode = ctx.episode || 1;
    const filtered = filterKnowledgeByEpisode(knowledge, episode);
    const knowledgePrompt = knowledgeToPrompt(filtered);
    parts.push(knowledgePrompt);
  } else {
    // 通用 fallback：没有结构化知识库也能正常陪看
    parts.push(genericFallbackPrompt(ctx.title, ctx.episode));
  }

  return parts.join('\n');
}

