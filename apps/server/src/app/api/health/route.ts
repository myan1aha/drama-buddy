import { checkHealth } from '@/lib/ai-client';

export const runtime = 'nodejs';

/**
 * GET /api/health — Check AI provider connectivity
 */
export async function GET() {
  const result = await checkHealth();

  return Response.json(result, {
    status: result.ok ? 200 : 503,
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}
