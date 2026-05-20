import React from 'react';
import './QuickActions.css';

interface QuickActionsProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const QUICK_PHRASES = [
  { emoji: '😭', text: '这段太好哭了' },
  { emoji: '🔥', text: '绝了绝了！' },
  { emoji: '😡', text: '气死我了' },
  { emoji: '🤔', text: '他为什么这么做？' },
  { emoji: '💀', text: '我人傻了' },
  { emoji: '❤️', text: '嗑到了！' },
  { emoji: '😱', text: '不会吧！' },
  { emoji: '🎬', text: '这个镜头好美' },
  { emoji: '🧐', text: '有什么伏笔吗？' },
  { emoji: '💬', text: '帮我分析这个角色' },
  { emoji: '⏭️', text: '接下来会怎样？' },
  { emoji: '🎵', text: '配乐是什么？' },
];

export function QuickActions({ onSend, disabled }: QuickActionsProps) {
  return (
    <div className="quick-actions">
      <div className="quick-actions-label">快捷互动</div>
      <div className="quick-actions-grid">
        {QUICK_PHRASES.map((phrase) => (
          <button
            key={phrase.text}
            className="quick-action-btn tv-focusable"
            onClick={() => onSend(`${phrase.emoji} ${phrase.text}`)}
            disabled={disabled}
            tabIndex={0}
          >
            <span className="quick-action-emoji">{phrase.emoji}</span>
            <span className="quick-action-text">{phrase.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
