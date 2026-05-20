import { NextRequest } from 'next/server';
import { listAvailableDramas, addCustomKnowledge, findDramaKnowledge, filterKnowledgeByEpisode, knowledgeToPrompt } from '@/lib/knowledge';

export const runtime = 'nodejs';

/**
 * GET /api/knowledge — 列出所有可用剧集知识库
 * GET /api/knowledge?title=繁花&episode=5 — 查询特定剧集的过滤后知识
 */
export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get('title');
  const episode = Number(req.nextUrl.searchParams.get('episode')) || 1;

  if (title) {
    const knowledge = findDramaKnowledge(title);
    if (!knowledge) {
      return Response.json({
        found: false,
        message: `未找到"${title}"的知识库，AI 将基于通用知识回答`,
        availableDramas: listAvailableDramas(),
      });
    }

    const filtered = filterKnowledgeByEpisode(knowledge, episode);
    return Response.json({
      found: true,
      drama: {
        id: knowledge.id,
        title: knowledge.title,
        totalEpisodes: knowledge.totalEpisodes,
        genre: knowledge.genre,
        year: knowledge.year,
        synopsis: knowledge.synopsis,
        notes: knowledge.notes,
      },
      filtered,
      promptPreview: knowledgeToPrompt(filtered),
    });
  }

  return Response.json({
    dramas: listAvailableDramas(),
  });
}

/**
 * POST /api/knowledge — 添加自定义剧集知识库
 * Body: DramaKnowledge JSON
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 基本校验
    if (!body.id || !body.title || !body.characters) {
      return Response.json(
        { error: '缺少必填字段：id, title, characters' },
        { status: 400 }
      );
    }

    addCustomKnowledge(body);

    return Response.json({
      success: true,
      message: `已添加"${body.title}"的知识库（${body.characters.length}个角色）`,
    });
  } catch (error) {
    return Response.json(
      { error: '无效的 JSON 格式' },
      { status: 400 }
    );
  }
}
