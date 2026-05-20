import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  PetState,
  PetSpecies,
  EvolutionStage,
  PetMood,
  PetExpression,
  PetColorTheme,
} from '@drama-buddy/shared/pet';
import './PetAvatar.css';

/** 物种 → Emoji 映射 */
const SPECIES_EMOJI: Record<PetSpecies, Record<EvolutionStage, string>> = {
  blob: { egg: '🥚', baby: '🫧', teen: '💧', adult: '🔮', elder: '💎', legendary: '🌟' },
  cat: { egg: '🥚', baby: '🐱', teen: '😺', adult: '🐈', elder: '🐈‍⬛', legendary: '✨🐈✨' },
  fox: { egg: '🥚', baby: '🦊', teen: '🦊', adult: '🦊', elder: '🦊', legendary: '✨🦊✨' },
  owl: { egg: '🥚', baby: '🐣', teen: '🦉', adult: '🦉', elder: '🦉', legendary: '✨🦉✨' },
  dragon: { egg: '🥚', baby: '🐲', teen: '🐉', adult: '🐉', elder: '🐉', legendary: '✨🐉✨' },
  ghost: { egg: '🥚', baby: '👻', teen: '👻', adult: '👻', elder: '👻', legendary: '✨👻✨' },
};

/** 情绪 → 表情叠加 */
const MOOD_OVERLAY: Record<PetMood, string> = {
  happy: '😊',
  excited: '🤩',
  thinking: '🤔',
  sleepy: '😴',
  sad: '😢',
  angry: '😤',
  shocked: '😱',
  love: '😍',
  neutral: '',
};

/** 表情动画class */
const EXPRESSION_CLASS: Record<PetExpression, string> = {
  idle: 'expr-idle',
  blink: 'expr-blink',
  talk: 'expr-talk',
  laugh: 'expr-laugh',
  cry: 'expr-cry',
  gasp: 'expr-gasp',
  'heart-eyes': 'expr-heart-eyes',
  rage: 'expr-rage',
  sleep: 'expr-sleep',
  sparkle: 'expr-sparkle',
  bounce: 'expr-bounce',
};

interface PetAvatarProps {
  pet: PetState;
  size?: 'sm' | 'md' | 'lg';
  expression?: PetExpression;
  showInfo?: boolean;
  onClick?: () => void;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({
  pet,
  size = 'md',
  expression = 'idle',
  showInfo = true,
  onClick,
}) => {
  const [currentExpression, setCurrentExpression] = useState<PetExpression>(expression);
  const [isAnimating, setIsAnimating] = useState(false);

  // 随机眨眼
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (currentExpression === 'idle') {
        setCurrentExpression('blink');
        setTimeout(() => setCurrentExpression('idle'), 300);
      }
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(blinkInterval);
  }, [currentExpression]);

  // 外部 expression 变化
  useEffect(() => {
    setCurrentExpression(expression);
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
      if (expression !== 'idle') {
        setCurrentExpression('idle');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [expression]);

  const emoji = useMemo(() => {
    return SPECIES_EMOJI[pet.species]?.[pet.stage] || '🥚';
  }, [pet.species, pet.stage]);

  const moodOverlay = MOOD_OVERLAY[pet.mood];

  const moodClass = `mood-${pet.mood}`;
  const stageClass = `stage-${pet.stage}`;
  const exprClass = EXPRESSION_CLASS[currentExpression];

  // 经验条百分比
  const expPercent = pet.expToNext > 0 ? (pet.exp / pet.expToNext) * 100 : 0;

  // CSS 变量注入颜色主题
  const themeVars = {
    '--pet-primary': pet.colorTheme.primary,
    '--pet-secondary': pet.colorTheme.secondary,
    '--pet-accent': pet.colorTheme.accent,
    '--pet-eye': pet.colorTheme.eye,
  } as React.CSSProperties;

  return (
    <div
      className={`pet-avatar pet-size-${size} ${moodClass} ${stageClass}`}
      style={themeVars}
      onClick={onClick}
    >
      {/* 光环/背景特效 */}
      <div className="pet-aura">
        {pet.stage === 'legendary' && <div className="legendary-particles" />}
        {pet.stage === 'elder' && <div className="elder-glow" />}
      </div>

      {/* 配件层 - 帽子 */}
      <div className="pet-accessories-top">
        {pet.accessories
          .map((id) => {
            const acc = ALL_ACCESSORIES_MAP[id];
            return acc?.category === 'hat' ? (
              <span key={id} className="accessory accessory-hat" style={{ top: acc.position.top, left: acc.position.left }}>
                {acc.emoji}
              </span>
            ) : null;
          })}
      </div>

      {/* 主体 */}
      <div className={`pet-body ${exprClass} ${isAnimating ? 'animating' : ''}`}>
        <span className="pet-emoji">{emoji}</span>

        {/* 眼镜层 */}
        {pet.accessories
          .map((id) => {
            const acc = ALL_ACCESSORIES_MAP[id];
            return acc?.category === 'glasses' ? (
              <span key={id} className="accessory accessory-glasses">
                {acc.emoji}
              </span>
            ) : null;
          })}
      </div>

      {/* 围巾 */}
      <div className="pet-accessories-bottom">
        {pet.accessories
          .map((id) => {
            const acc = ALL_ACCESSORIES_MAP[id];
            return acc?.category === 'scarf' ? (
              <span key={id} className="accessory accessory-scarf">
                {acc.emoji}
              </span>
            ) : null;
          })}
      </div>

      {/* 情绪气泡 */}
      {moodOverlay && (
        <div className="pet-mood-bubble">
          <span>{moodOverlay}</span>
        </div>
      )}

      {/* 特效层 */}
      <div className="pet-effects">
        {pet.accessories
          .map((id) => {
            const acc = ALL_ACCESSORIES_MAP[id];
            return acc?.category === 'effect' ? (
              <span key={id} className={`effect effect-${id}`}>
                {acc.emoji}
              </span>
            ) : null;
          })}
      </div>

      {/* 徽章 */}
      <div className="pet-badges">
        {pet.accessories
          .map((id) => {
            const acc = ALL_ACCESSORIES_MAP[id];
            return acc?.category === 'badge' ? (
              <span key={id} className="badge-item" title={acc.name}>
                {acc.emoji}
              </span>
            ) : null;
          })}
      </div>

      {/* 信息面板 */}
      {showInfo && (
        <div className="pet-info">
          <div className="pet-name">{pet.name}</div>
          <div className="pet-level">Lv.{pet.level} {pet.stage}</div>
          <div className="pet-exp-bar">
            <div className="pet-exp-fill" style={{ width: `${expPercent}%` }} />
          </div>
        </div>
      )}
    </div>
  );
};

/** 配件快速查找 Map */
const ALL_ACCESSORIES_MAP: Record<string, { category: string; position: { top: number; left: number }; emoji: string; name: string }> = {};

// 从 engine 中定义的配件列表填充（这里内联以避免服务端依赖）
const ACCESSORIES_DATA = [
  { id: 'hat-party', name: '派对帽', category: 'hat', position: { top: -15, left: 0 }, emoji: '🎉' },
  { id: 'hat-crown', name: '皇冠', category: 'hat', position: { top: -18, left: 0 }, emoji: '👑' },
  { id: 'hat-wizard', name: '巫师帽', category: 'hat', position: { top: -20, left: -2 }, emoji: '🧙' },
  { id: 'glasses-cool', name: '墨镜', category: 'glasses', position: { top: 2, left: 0 }, emoji: '🕶️' },
  { id: 'glasses-nerd', name: '书呆子眼镜', category: 'glasses', position: { top: 2, left: 0 }, emoji: '🤓' },
  { id: 'scarf-red', name: '红围巾', category: 'scarf', position: { top: 18, left: 0 }, emoji: '🧣' },
  { id: 'badge-drama', name: '追剧达人', category: 'badge', position: { top: 10, left: 15 }, emoji: '🎬' },
  { id: 'badge-night', name: '夜猫子', category: 'badge', position: { top: 10, left: 15 }, emoji: '🦉' },
  { id: 'badge-legend', name: '传说', category: 'badge', position: { top: 10, left: 15 }, emoji: '⭐' },
  { id: 'effect-sparkle', name: '闪闪发光', category: 'effect', position: { top: 0, left: 0 }, emoji: '✨' },
  { id: 'effect-fire', name: '燃烧', category: 'effect', position: { top: 0, left: 0 }, emoji: '🔥' },
  { id: 'effect-rainbow', name: '彩虹', category: 'effect', position: { top: -20, left: 0 }, emoji: '🌈' },
];
ACCESSORIES_DATA.forEach((a) => { ALL_ACCESSORIES_MAP[a.id] = a; });

export default PetAvatar;
