import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useChatStream } from '@drama-buddy/shared/hooks/use-chat-stream';
import { useSpeechInput } from '@drama-buddy/shared/hooks/use-speech-input';
import { useScreenOCR } from '@drama-buddy/shared/hooks/use-screen-ocr';
import { useCast } from '@drama-buddy/shared/hooks/use-cast';
import { getUserId } from '@drama-buddy/shared/hooks/use-identity';
import type { DramaContext } from '@drama-buddy/shared';
import { PetAvatar, PetCreation } from './pet';
import { usePet } from '@drama-buddy/shared/hooks/use-pet';
import type { PetExpression } from '@drama-buddy/shared/pet';
import './FloatingWidget.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export function FloatingWidget() {
  const [context, setContext] = useState<DramaContext>({ title: '' });
  const [input, setInput] = useState('');
  const [isSetup, setIsSetup] = useState(true);
  const [isPinned, setIsPinned] = useState(true);
  const [opacity, setOpacity] = useState(0.94);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [petExpression, setPetExpression] = useState<PetExpression>('idle');
  const [showPetPanel, setShowPetPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 用户身份
  const userId = getUserId();

  // Cast — 推送事件到 TV 端
  const { pushEvent } = useCast({
    serverUrl: SERVER_URL,
    roomId: userId,
    autoConnect: false, // Desktop 端只推送，不订阅
  });

  // 宠物系统
  const { pet, createPet: createPetFn, addExp, updateMood } = usePet({
    userId,
    serverUrl: SERVER_URL,
    autoSync: true,
  });

  const { messages, isStreaming, sendMessage, clearMessages } = useChatStream({
    serverUrl: SERVER_URL,
    context,
  });

  // 语音输入
  const {
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    supported: speechSupported,
  } = useSpeechInput({
    serverUrl: SERVER_URL,
    mode: 'browser', // 桌面端优先用浏览器原生（零延迟）
    onResult: (text) => {
      // 语音识别结果直接发送
      if (text.trim()) {
        sendMessage(text.trim());
      }
    },
  });

  // 屏幕 OCR
  const { isProcessing: isOCRing, captureAndRecognize } = useScreenOCR({
    serverUrl: SERVER_URL,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Toggle always-on-top
  const togglePin = useCallback(async () => {
    const appWindow = getCurrentWindow();
    const newPinned = !isPinned;
    await appWindow.setAlwaysOnTop(newPinned);
    setIsPinned(newPinned);
  }, [isPinned]);

  // Close window
  const handleClose = useCallback(async () => {
    const appWindow = getCurrentWindow();
    await appWindow.close();
  }, []);

  // Minimize
  const handleMinimize = useCallback(async () => {
    const appWindow = getCurrentWindow();
    await appWindow.minimize();
  }, []);

  // Adjust opacity
  const handleOpacityChange = useCallback(async (value: number) => {
    setOpacity(value);
    document.documentElement.style.setProperty('--widget-opacity', value.toString());
  }, []);

  // 语音按钮
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // OCR 截屏识别
  const handleOCR = async () => {
    setOcrStatus('截屏中...');
    const result = await captureAndRecognize({ type: 'screen' });
    if (result) {
      // 更新上下文
      setContext((prev) => ({
        ...prev,
        sceneDescription: result.sceneDescription,
      }));

      // 推送 OCR 结果到 TV 端
      pushEvent('ocr_result', {
        subtitles: result.subtitles,
        sceneDescription: result.sceneDescription,
      });

      // 如果有字幕，自动发一条消息让 AI 分析
      if (result.subtitles) {
        setOcrStatus(`字幕: ${result.subtitles.slice(0, 30)}...`);
        sendMessage(`[当前字幕] "${result.subtitles}" — 聊聊这句台词`);
      } else if (result.sceneDescription) {
        setOcrStatus(`场景: ${result.sceneDescription.slice(0, 30)}...`);
        sendMessage(`[当前画面] ${result.sceneDescription} — 这段怎么看？`);
      } else {
        setOcrStatus('未识别到内容');
      }

      // 3秒后清除状态
      setTimeout(() => setOcrStatus(''), 3000);
    } else {
      setOcrStatus('识别失败');
      setTimeout(() => setOcrStatus(''), 3000);
    }
  };

  const handleSend = () => {
    if (input.trim() && !isStreaming) {
      sendMessage(input.trim());
      // 宠物：增加经验 + 更新情绪
      addExp('send_message');
      updateMood(input.trim());
      setPetExpression('talk');
      setTimeout(() => setPetExpression('idle'), 1500);
      setInput('');
    }
  };

  const quickPhrases = [
    '😭 好哭',
    '🔥 绝了',
    '😡 气死',
    '🤔 为啥',
    '💀 震惊',
    '❤️ 嗑到',
  ];

  if (isSetup) {
    // 如果没有宠物，先创建宠物
    if (!pet) {
      return (
        <div className="widget setup">
          <div className="titlebar" data-tauri-drag-region="">
            <div className="titlebar-controls">
              <button className="titlebar-btn close" onClick={handleClose} title="关闭">×</button>
              <button className="titlebar-btn minimize" onClick={handleMinimize} title="最小化">−</button>
            </div>
          </div>
          <PetCreation onCreated={(name, species) => createPetFn(name, species)} />
        </div>
      );
    }

    return (
      <div className="widget setup">
        <div className="titlebar" data-tauri-drag-region="">
          <div className="titlebar-controls">
            <button className="titlebar-btn close" onClick={handleClose} title="关闭">×</button>
            <button className="titlebar-btn minimize" onClick={handleMinimize} title="最小化">−</button>
          </div>
        </div>
        <div className="setup-content">
          {/* 显示宠物 */}
          <PetAvatar pet={pet} size="md" expression={petExpression} showInfo={true} />
          <h3>你在看什么剧？</h3>
          <input
            className="setup-input"
            placeholder="输入剧名..."
            value={context.title}
            onChange={(e) => setContext({ ...context, title: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && context.title.trim()) {
                setIsSetup(false);
              }
            }}
            autoFocus
          />
          <input
            className="setup-input"
            placeholder="第几集（可选）"
            type="number"
            min="1"
            onChange={(e) =>
              setContext({ ...context, episode: Number(e.target.value) || undefined })
            }
          />
          <button
            className="setup-btn"
            onClick={() => setIsSetup(false)}
            disabled={!context.title.trim()}
          >
            开始看剧 🍿
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="widget chat" style={{ opacity }}>
      {/* 可拖拽标题栏 */}
      <div className="header" data-tauri-drag-region="">
        <span className="header-title">🎬 {context.title}{context.episode ? ` · 第${context.episode}集` : ''}</span>
        <div className="header-actions">
          <input
            type="range"
            min="0.3"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => handleOpacityChange(Number(e.target.value))}
            className="opacity-slider"
            title={`透明度 ${Math.round(opacity * 100)}%`}
          />
          <button
            className={`header-btn ${isPinned ? 'active' : ''}`}
            onClick={togglePin}
            title={isPinned ? '取消置顶' : '置顶'}
          >
            📌
          </button>
          <button
            className="header-btn"
            onClick={() => { clearMessages(); setIsSetup(true); }}
            title="换一部剧"
          >
            ↩
          </button>
          <button className="header-btn" onClick={handleMinimize} title="最小化">−</button>
          <button className="header-btn close-btn" onClick={handleClose} title="关闭">×</button>
        </div>
      </div>

      {/* 宠物头像区域 */}
      {pet && (
        <div className="pet-header-area" onClick={() => setShowPetPanel(!showPetPanel)}>
          <PetAvatar pet={pet} size="sm" expression={petExpression} showInfo={false} />
          <div className="pet-quick-info">
            <span className="pet-header-name">{pet.name}</span>
            <span className="pet-header-level">Lv.{pet.level}</span>
          </div>
        </div>
      )}

      {/* OCR 状态提示 */}
      {ocrStatus && (
        <div className="ocr-status">{ocrStatus}</div>
      )}

      {/* 语音实时转写提示 */}
      {isListening && interimTranscript && (
        <div className="voice-interim">🎙️ {interimTranscript}</div>
      )}

      {/* 消息列表 */}
      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-hint">
            开始聊聊这部剧吧！💬<br/>
            🎙️ 按住语音键说话 · 📷 截屏识别字幕
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`msg ${msg.role}`}>
            {msg.content}
            {msg.role === 'assistant' && !msg.content && isStreaming && (
              <span className="typing">●●●</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 快捷短语 */}
      <div className="quick-phrases">
        {quickPhrases.map((phrase) => (
          <button
            key={phrase}
            className="quick-btn"
            onClick={() => sendMessage(phrase)}
            disabled={isStreaming}
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* 输入区域 + 语音/OCR 按钮 */}
      <div className="input-area">
        {/* 语音按钮 */}
        {speechSupported && (
          <button
            className={`voice-btn ${isListening ? 'listening' : ''}`}
            onClick={handleVoiceToggle}
            title={isListening ? '停止语音' : '语音输入'}
          >
            🎙️
          </button>
        )}

        {/* OCR 截屏按钮 */}
        <button
          className={`ocr-btn ${isOCRing ? 'processing' : ''}`}
          onClick={handleOCR}
          disabled={isOCRing}
          title="截屏识别字幕"
        >
          📷
        </button>

        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={isListening ? '正在听...' : '聊聊剧情...'}
          disabled={isStreaming}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
