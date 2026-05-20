import React, { useState, useEffect } from 'react';
import './InstallPrompt.css';

/**
 * iPad PWA 安装提示
 * 仅在 Safari 且非 standalone 模式下显示
 */
export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 判断是否已在 standalone 模式（已安装 PWA）
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // 判断是否为 iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // 检查是否已经关闭过提示
    const dismissed = localStorage.getItem('pwa-install-dismissed');

    if (!isStandalone && isIOS && !dismissed) {
      // 延迟显示，避免干扰首屏体验
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <span className="install-prompt-icon">📲</span>
        <div className="install-prompt-text">
          <strong>添加到主屏幕</strong>
          <span>点击 Safari 底部 <span className="install-share-icon">⬆</span> → "添加到主屏幕" 获得全屏体验</span>
        </div>
        <button className="install-prompt-close" onClick={handleDismiss}>✕</button>
      </div>
    </div>
  );
}
