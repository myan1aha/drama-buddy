import { NextRequest } from 'next/server';
import { transcribeAudio } from '@/lib/ai-client';

export const runtime = 'nodejs';

/**
 * 语音转文字 API
 * POST /api/speech
 * Body: FormData { audio: Blob, lang?: string }
 * Response: { text: string } | { error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const lang = (formData.get('lang') as string) || 'zh';

    if (!audioFile) {
      return Response.json({ error: '缺少音频文件' }, { status: 400 });
    }

    const text = await transcribeAudio(audioFile, lang);

    return Response.json({ text, duration: null });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Speech API Error]', msg);
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
