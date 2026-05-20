import React, { useEffect, useState } from 'react';
import './StatusBar.css';

interface StatusBarProps {
  dramaTitle: string;
  episode?: number;
  isConnected: boolean;
}

export function StatusBar({ dramaTitle, episode, isConnected }: StatusBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
        <span className="status-drama">
          🎬 {dramaTitle}
          {episode ? ` · 第${episode}集` : ''}
        </span>
      </div>
      <div className="status-bar-right">
        <span className="status-time">{timeStr}</span>
      </div>
    </div>
  );
}
