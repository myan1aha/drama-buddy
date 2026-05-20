import React from 'react';
import type { DramaContext } from '@drama-buddy/shared';
import './DramaSetup.css';

interface DramaSetupProps {
  context: DramaContext;
  onChange: (ctx: DramaContext) => void;
  onStart: () => void;
}

/** TV 端选剧界面 - 大按钮大字体 */
export function DramaSetup({ context, onChange, onStart }: DramaSetupProps) {
  return (
    <div className="drama-setup">
      <div className="drama-setup-card">
        <div className="drama-setup-icon">🎬</div>
        <h1 className="drama-setup-title">Drama Buddy</h1>
        <p className="drama-setup-subtitle">你的 AI 看剧伙伴</p>

        <div className="drama-setup-form">
          <input
            className="drama-setup-input tv-focusable"
            placeholder="输入你在看的剧名..."
            value={context.title}
            onChange={(e) => onChange({ ...context, title: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && context.title.trim()) onStart();
            }}
            autoFocus
          />
          <input
            className="drama-setup-input tv-focusable"
            placeholder="第几集（可选）"
            type="number"
            min="1"
            onChange={(e) =>
              onChange({ ...context, episode: Number(e.target.value) || undefined })
            }
          />
          <button
            className="drama-setup-btn tv-focusable"
            onClick={onStart}
            disabled={!context.title.trim()}
          >
            开始看剧 🍿
          </button>
        </div>

        <div className="drama-setup-hint">
          使用遥控器方向键导航，确认键选择
        </div>
      </div>
    </div>
  );
}
