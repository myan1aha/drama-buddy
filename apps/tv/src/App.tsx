import React, { useState, useRef, useCallback } from 'react';
import { useChatStream } from '@drama-buddy/shared/hooks/use-chat-stream';
import { useSpeechInput } from '@drama-buddy/shared/hooks/use-speech-input';
import { usePet } from '@drama-buddy/shared/hooks/use-pet';
import { useCast } from '@drama-buddy/shared/hooks/use-cast';
import { getUserId } from '@drama-buddy/shared/hooks/use-identity';
import type { DramaContext } from '@drama-buddy/shared';
import type { CastEvent } from '@drama-buddy/shared/hooks/use-cast';
import { useDpadNavigation } from './hooks/use-dpad-navigation';
import { DramaSetup } from './components/DramaSetup';
import { StatusBar } from './components/StatusBar';
import { ChatPanel } from './components/ChatPanel';
import { QuickActions } from './components/QuickActions';
import { VoiceIndicator } from './components/VoiceIndicator';
import { InstallPrompt } from './components/InstallPrompt';
import './styles/tv-app.css';

// 服务端地址 - TV 端通过局域网访问
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://192.168.1.100:3000';

export default function App() {
  const [context, setContext] = useState<DramaContext>({ title: '' });
  const [isSetup, setIsSetup] = useState(true);
  const [panelVisible, setPanelVisible] = useState(true);
  const [castStatus, setCastStatus] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // 用户身份
  const userId = getUserId();

  // 宠物系统
  const { pet, addExp, updateMood } = usePet({
    userId,
    serverUrl: SERVER_URL,
    autoSync: true,
  });

  const { messages, isStreaming, sendMessage, clearMessages } = useChatStream({
    serverUrl: SERVER_URL,
    context,
    userId,
    onPetUpdate: (update) => {
      // Pet level-up / evolution notifications could be displayed
      if (update.leveledUp) {
        setCastStatus(`🎉 ${pet?.name || '宠物'} 升级了！Lv.${update.level}`);
        setTimeout(() => setCastStatus(''), 4000);
      }
      if (update.evolved) {
        setCastStatus(`✨ ${pet?.name || '宠物'} 进化为 ${update.newStage}！`);
        setTimeout(() => setCastStatus(''), 5000);
      }
    },
  });

  // Cast 订阅 — 接收来自 Desktop/Phone 推送的事件
  const handleCastEvent = useCallback((event: CastEvent) => {
    switch (event.type) {
      case 'chat_message':
        // Desktop 发来的聊天消息 → 直接交给 AI
        if (event.data?.content) {
          sendMessage(event.data.content);
        }
        break;
      case 'ocr_result':
        // Desktop 截屏识别结果
        if (event.data?.subtitles) {
          setCastStatus(`📷 字幕: ${event.data.subtitles.slice(0, 40)}`);
          sendMessage(`[当前字幕] "${event.data.subtitles}" — 聊聊这句台词`);
        } else if (event.data?.sceneDescription) {
          setCastStatus(`📷 画面: ${event.data.sceneDescription.slice(0, 40)}`);
          sendMessage(`[当前画面] ${event.data.sceneDescription} — 这段怎么看？`);
        }
        setTimeout(() => setCastStatus(''), 4000);
        break;
      case 'drama_context':
        // Desktop 更新了观看上下文
        if (event.data?.title) {
          setContext((prev) => ({ ...prev, ...event.data }));
          setCastStatus(`📺 同步: ${event.data.title}${event.data.episode ? ` 第${event.data.episode}集` : ''}`);
          setTimeout(() => setCastStatus(''), 3000);
        }
        break;
      case 'voice_input':
        // 来自其他设备的语音输入
        if (event.data?.text) {
          sendMessage(event.data.text);
        }
        break;
      case 'command':
        // 远程控制命令
        if (event.data?.action === 'toggle_panel') {
          setPanelVisible((v) => !v);
        } else if (event.data?.action === 'clear') {
          clearMessages();
        }
        break;
      default:
        break;
    }
  }, [sendMessage, clearMessages]);

  const { isConnected: isCastConnected, viewers } = useCast({
    serverUrl: SERVER_URL,
    roomId: userId, // 使用 userId 作为房间 ID，多设备同步
    autoConnect: !isSetup, // 进入看剧模式后自动连接
    onEvent: handleCastEvent,
  });

  // 语音输入 — TV 端核心交互方式
  const {
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    supported: speechSupported,
  } = useSpeechInput({
    serverUrl: SERVER_URL,
    mode: 'browser',
    onResult: (text) => {
      if (text.trim()) {
        sendMessage(text.trim());
        addExp('voice_input');
        updateMood(text.trim());
      }
    },
  });

  // D-pad 导航
  useDpadNavigation(containerRef);

  if (isSetup) {
    return (
      <div ref={containerRef}>
        <DramaSetup
          context={context}
          onChange={setContext}
          onStart={() => setIsSetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="tv-app" ref={containerRef}>
      {/* iPad PWA 安装提示 */}
      <InstallPrompt />

      {/* 顶部状态栏 */}
      <StatusBar
        dramaTitle={context.title}
        episode={context.episode}
        isConnected={isCastConnected}
      />

      {/* Cast 状态提示 */}
      {castStatus && (
        <div className="tv-cast-status">{castStatus}</div>
      )}

      {/* Cast 连接指示 */}
      {isCastConnected && viewers > 0 && (
        <div className="tv-cast-badge">📡 已连接 · {viewers} 设备</div>
      )}

      {/* 宠物显示区 - TV 左上角 */}
      {pet && (
        <div className="tv-pet-area">
          <span className="tv-pet-emoji">{getPetEmoji(pet.species, pet.stage)}</span>
          <span className="tv-pet-name">{pet.name} Lv.{pet.level}</span>
        </div>
      )}

      {/* 语音状态指示器 */}
      {isListening && (
        <VoiceIndicator transcript={interimTranscript} />
      )}

      {/* 主体区域 */}
      <div className="tv-main">
        {/* 左侧：操作区 */}
        <div className="tv-left">
          {/* 控制按钮 */}
          <div className="tv-controls">
            {/* 语音按钮 — TV 遥控器核心 */}
            {speechSupported && (
              <button
                className={`tv-control-btn tv-voice-btn tv-focusable ${isListening ? 'listening' : ''}`}
                onClick={() => isListening ? stopListening() : startListening()}
              >
                {isListening ? '🔴 停止语音' : '🎙️ 语音输入'}
              </button>
            )}
            <button
              className="tv-control-btn tv-focusable"
              onClick={() => setPanelVisible(!panelVisible)}
            >
              {panelVisible ? '隐藏对话' : '显示对话'}
            </button>
            <button
              className="tv-control-btn tv-focusable"
              onClick={() => {
                clearMessages();
                setIsSetup(true);
              }}
            >
              换一部剧
            </button>
          </div>

          {/* 快捷短语 */}
          <QuickActions onSend={(text) => {
            sendMessage(text);
            addExp('send_message');
            updateMood(text);
          }} disabled={isStreaming} />
        </div>

        {/* 右侧：聊天面板 */}
        {panelVisible && (
          <ChatPanel messages={messages} isStreaming={isStreaming} />
        )}
      </div>
    </div>
  );
}

/** 物种+阶段 → Emoji */
function getPetEmoji(species: string, stage: string): string {
  const map: Record<string, Record<string, string>> = {
    blob: { egg: '🥚', baby: '🫧', teen: '💧', adult: '🔮', elder: '💎', legendary: '🌟' },
    cat: { egg: '🥚', baby: '🐱', teen: '😺', adult: '🐈', elder: '🐈‍⬛', legendary: '🐈' },
    fox: { egg: '🥚', baby: '🦊', teen: '🦊', adult: '🦊', elder: '🦊', legendary: '🦊' },
    owl: { egg: '🥚', baby: '🐣', teen: '🦉', adult: '🦉', elder: '🦉', legendary: '🦉' },
    dragon: { egg: '🥚', baby: '🐲', teen: '🐉', adult: '🐉', elder: '🐉', legendary: '🐉' },
    ghost: { egg: '🥚', baby: '👻', teen: '👻', adult: '👻', elder: '👻', legendary: '👻' },
  };
  return map[species]?.[stage] || '🥚';
}
