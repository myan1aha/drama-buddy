/**
 * Cast Hook — TV 端订阅 Desktop/Phone 推送的实时事件
 * 自动重连 + 事件缓冲恢复
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export interface CastEvent {
  type: string;
  data: any;
  timestamp: number;
  userId?: string;
}

interface UseCastOptions {
  serverUrl: string;
  roomId: string;
  /** Auto-connect on mount */
  autoConnect?: boolean;
  /** Event handler */
  onEvent?: (event: CastEvent) => void;
}

interface UseCastReturn {
  isConnected: boolean;
  viewers: number;
  lastEvent: CastEvent | null;
  connect: () => void;
  disconnect: () => void;
  /** Send event from this device (used by Desktop/Phone) */
  pushEvent: (type: string, data: any) => Promise<void>;
}

export function useCast({
  serverUrl,
  roomId,
  autoConnect = true,
  onEvent,
}: UseCastOptions): UseCastReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [lastEvent, setLastEvent] = useState<CastEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const since = lastTimestampRef.current;
    const url = `${serverUrl}/api/cast?room=${encodeURIComponent(roomId)}${since ? `&since=${since}` : ''}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      retryCountRef.current = 0;
    };

    es.onmessage = (e) => {
      try {
        const event: CastEvent = JSON.parse(e.data);
        lastTimestampRef.current = event.timestamp || Date.now();
        setLastEvent(event);

        // Handle system events
        if (event.type === 'connected') {
          setViewers(event.data?.viewers || 0);
        } else if (event.type === 'viewer_left') {
          setViewers(event.data?.viewers || 0);
        }

        // Forward to handler
        onEventRef.current?.(event);
      } catch {}
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();

      // Exponential backoff reconnect
      retryCountRef.current++;
      const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
      setTimeout(() => {
        if (eventSourceRef.current === es) {
          connect();
        }
      }, delay);
    };
  }, [serverUrl, roomId]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const pushEvent = useCallback(
    async (type: string, data: any) => {
      await fetch(`${serverUrl}/api/cast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, type, data }),
      });
    },
    [serverUrl, roomId]
  );

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  return { isConnected, viewers, lastEvent, connect, disconnect, pushEvent };
}
