import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '@drama-buddy/shared';
import './ChatPanel.css';

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

/**
 * 电视端右侧聊天面板
 * 大字体、高对比度，适合远距离观看
 */
export function ChatPanel({ messages, isStreaming }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-panel">
      <div className="chat-panel-header">
        <span className="chat-panel-dot" />
        <span>AI 看剧伙伴</span>
      </div>

      <div className="chat-panel-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-panel-empty">
            选择下方快捷短语开始聊天 👇
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-panel-msg ${msg.role}`}>
            <div className="chat-panel-msg-label">
              {msg.role === 'user' ? '你' : '🤖 AI'}
            </div>
            <div className="chat-panel-msg-content">
              {msg.content}
              {msg.role === 'assistant' && !msg.content && isStreaming && (
                <span className="chat-panel-typing">思考中...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
