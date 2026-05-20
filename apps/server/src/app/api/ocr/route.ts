import { NextRequest } from 'next/server';
import { analyzeImage } from '@/lib/ai-client';

export const runtime = 'nodejs';

const OCR_SYSTEM_PROMPT = `你是一个专业的视频画面分析助手。请分析用户提供的视频截图，提取以下信息：
1. 字幕文字（subtitles）：画面底部或顶部的字幕文本，原样提取
2. 场景描述（sceneDescription）：简要描述画面中正在发生什么（人物、动作、情绪、环境），不超过50字

请严格以 JSON 格式返回：
{"subtitles": "字幕内容", "sceneDescription": "场景描述"}

如果没有字幕则 subtitles 为空字符串。`;

/**
 * 屏幕 OCR API — 使用 Vision 模型识别字幕和场景
 * POST /api/ocr
 * Body: FormData { image: Blob }
 * Response: { subtitles: string, sceneDescription: string }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return Response.json({ error: '缺少图片文件' }, { status: 400 });
    }

    // 转为 base64
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const content = await analyzeImage({
      imageBase64: base64,
      mimeType: imageFile.type || 'image/jpeg',
      prompt: '请分析这个视频截图中的字幕和场景。',
      systemPrompt: OCR_SYSTEM_PROMPT,
      maxTokens: 300,
    });

    // 解析 JSON 响应
    let result = { subtitles: '', sceneDescription: '' };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch {
      result.sceneDescription = content.slice(0, 100);
    }

    return Response.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[OCR API Error]', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
