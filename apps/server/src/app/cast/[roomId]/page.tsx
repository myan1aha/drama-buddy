'use client';
import React, { useEffect, useState } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function CastPage({ params }: { params: { roomId: string } }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const es = new EventSource(`/api/cast?room=${params.roomId}`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    };

    es.onerror = () => {
      console.error('SSE connection error, reconnecting...');
    };

    return () => es.close();
  }, [params.roomId]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #0f0f14 0%, #1a1a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '60px',
        fontFamily: '-apple-system, sans-serif',
      }}
    >
      {/* 房间信息 */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          right: 40,
          color: 'rgba(255,255,255,0.3)',
          fontSize: 14,
        }}
      >
        房间: {params.roomId}
      </div>

      {/* 消息列表 */}
      <div
        style={{
          maxWidth: 450,
          alignSelf: 'flex-end',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>
            等待消息...用手机开始聊天吧 🎬
          </div>
        )}
        {messages.slice(-6).map((msg) => (
          <div
            key={msg.id}
            style={{
              padding: '12px 20px',
              borderRadius: 16,
              background:
                msg.role === 'user'
                  ? 'rgba(79, 70, 229, 0.85)'
                  : 'rgba(31, 41, 55, 0.85)',
              color: '#fff',
              fontSize: 20,
              lineHeight: 1.5,
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backdropFilter: 'blur(10px)',
              maxWidth: '100%',
              animation: 'fadeIn 0.3s ease-in',
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.6, display: 'block' }}>
              {msg.role === 'user' ? '👤 你' : '🤖 AI'}
            </span>
            {msg.content}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
