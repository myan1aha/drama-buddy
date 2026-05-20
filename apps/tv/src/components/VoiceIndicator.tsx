import React from 'react';
import './VoiceIndicator.css';

interface VoiceIndicatorProps {
  transcript: string;
}

/**
 * TV 端全屏语音指示器
 * 大字体显示实时转写，明显的录音状态
 */
export function VoiceIndicator({ transcript }: VoiceIndicatorProps) {
  return (
    <div className="voice-indicator">
      <div className="voice-indicator-inner">
        <div className="voice-waves">
          <span className="voice-wave" />
          <span className="voice-wave" />
          <span className="voice-wave" />
          <span className="voice-wave" />
          <span className="voice-wave" />
        </div>
        <div className="voice-label">正在聆听...</div>
        {transcript && (
          <div className="voice-transcript">{transcript}</div>
        )}
      </div>
    </div>
  );
}
