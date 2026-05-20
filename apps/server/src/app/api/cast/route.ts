import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

/**
 * Cast 投屏系统
 * Desktop/Phone → POST 推送事件 → TV 端通过 GET (SSE) 实时接收
 *
 * 事件类型:
 * - chat_message: 新聊天消息
 * - pet_update: 宠物状态变化
 * - drama_context: 切换剧集/更新进度
 * - ocr_result: 截屏识别结果
 * - voice_input: 语音输入文本
 * - command: 控制指令 (pause, resume, clear)
 */

interface CastEvent {
  type: string;
  data: any;
  timestamp: number;
  userId?: string;
}

interface Room {
  controllers: Set<ReadableStreamDefaultController>;
  /** 最近事件缓冲，新连接时推送（防断线丢消息） */
  recentEvents: CastEvent[];
  /** 当前看剧上下文 */
  context: { title: string; episode?: number } | null;
}

const rooms = new Map<string, Room>();
const MAX_RECENT_EVENTS = 20;

function getRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      controllers: new Set(),
      recentEvents: [],
      context: null,
    });
  }
  return rooms.get(roomId)!;
}

function broadcastToRoom(room: Room, event: CastEvent) {
  const encoder = new TextEncoder();
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  const encoded = encoder.encode(payload);

  for (const controller of room.controllers) {
    try {
      controller.enqueue(encoded);
    } catch {
      room.controllers.delete(controller);
    }
  }

  // Buffer recent events
  room.recentEvents.push(event);
  if (room.recentEvents.length > MAX_RECENT_EVENTS) {
    room.recentEvents.shift();
  }
}

/**
 * GET /api/cast?room=xxx — TV 端订阅 (SSE)
 * Optional: ?since=timestamp 获取断线期间的缓冲事件
 */
export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('room') || 'default';
  const since = Number(req.nextUrl.searchParams.get('since')) || 0;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const room = getRoom(roomId);
      room.controllers.add(controller);

      // Send connection confirmation
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: 'connected', data: { roomId, viewers: room.controllers.size } })}\n\n`
        )
      );

      // Send current context if available
      if (room.context) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'drama_context', data: room.context, timestamp: Date.now() })}\n\n`
          )
        );
      }

      // Send buffered events since disconnect
      if (since > 0) {
        const missed = room.recentEvents.filter((e) => e.timestamp > since);
        for (const event of missed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      }

      // Heartbeat every 25s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
          room.controllers.delete(controller);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        room.controllers.delete(controller);
        // Notify others that a viewer left
        broadcastToRoom(room, {
          type: 'viewer_left',
          data: { viewers: room.controllers.size },
          timestamp: Date.now(),
        });
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * POST /api/cast — Desktop/Phone 推送事件到房间
 * Body: { roomId, type, data, userId? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId = 'default', type, data, userId } = body;

    if (!type) {
      return Response.json({ error: '缺少 type' }, { status: 400 });
    }

    const room = getRoom(roomId);
    const event: CastEvent = {
      type,
      data,
      timestamp: Date.now(),
      userId,
    };

    // Update room context if drama_context event
    if (type === 'drama_context') {
      room.context = data;
    }

    broadcastToRoom(room, event);

    return Response.json({
      success: true,
      viewers: room.controllers.size,
      roomId,
    });
  } catch (error) {
    return Response.json({ error: '请求解析失败' }, { status: 400 });
  }
}

/**
 * DELETE /api/cast?room=xxx — 关闭房间
 */
export async function DELETE(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('room') || 'default';
  const room = rooms.get(roomId);

  if (room) {
    // Notify all viewers
    broadcastToRoom(room, {
      type: 'room_closed',
      data: { reason: 'Host disconnected' },
      timestamp: Date.now(),
    });

    // Close all connections
    for (const controller of room.controllers) {
      try {
        controller.close();
      } catch {}
    }
    rooms.delete(roomId);
  }

  return Response.json({ success: true, roomId });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
    },
  });
}
