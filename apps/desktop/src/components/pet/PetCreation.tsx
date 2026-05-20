import React, { useState } from 'react';
import type { PetSpecies } from '@drama-buddy/shared/pet';
import './PetCreation.css';

interface PetCreationProps {
  onCreated: (name: string, species: PetSpecies) => void;
}

const SPECIES_OPTIONS: { species: PetSpecies; emoji: string; label: string; desc: string }[] = [
  { species: 'blob', emoji: '🫧', label: '果冻球', desc: '可爱弹弹，百变形态' },
  { species: 'cat', emoji: '🐱', label: '猫咪', desc: '优雅慵懒，陪你追剧' },
  { species: 'fox', emoji: '🦊', label: '狐狸', desc: '机灵聪明，点评毒辣' },
  { species: 'owl', emoji: '🦉', label: '猫头鹰', desc: '博学多识，深度分析' },
  { species: 'dragon', emoji: '🐲', label: '小龙', desc: '霸气外露，热血沸腾' },
  { species: 'ghost', emoji: '👻', label: '幽灵', desc: '神秘莫测，脑洞大开' },
];

export const PetCreation: React.FC<PetCreationProps> = ({ onCreated }) => {
  const [name, setName] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<PetSpecies>('blob');
  const [step, setStep] = useState<'species' | 'name'>('species');

  const handleSubmit = () => {
    if (name.trim()) {
      onCreated(name.trim(), selectedSpecies);
    }
  };

  return (
    <div className="pet-creation">
      <div className="creation-header">
        <h3>孵化你的追剧伙伴</h3>
        <p className="creation-subtitle">它会陪你一起看剧、讨论剧情、共同成长</p>
      </div>

      {step === 'species' && (
        <div className="creation-step">
          <p className="step-label">选择物种</p>
          <div className="species-grid">
            {SPECIES_OPTIONS.map((opt) => (
              <button
                key={opt.species}
                className={`species-card ${selectedSpecies === opt.species ? 'selected' : ''}`}
                onClick={() => setSelectedSpecies(opt.species)}
              >
                <span className="species-emoji">{opt.emoji}</span>
                <span className="species-name">{opt.label}</span>
                <span className="species-desc">{opt.desc}</span>
              </button>
            ))}
          </div>
          <button className="creation-btn" onClick={() => setStep('name')}>
            下一步
          </button>
        </div>
      )}

      {step === 'name' && (
        <div className="creation-step">
          <p className="step-label">给它起个名字吧</p>
          <div className="selected-preview">
            <span className="preview-emoji">
              {SPECIES_OPTIONS.find((o) => o.species === selectedSpecies)?.emoji}
            </span>
          </div>
          <input
            className="name-input"
            type="text"
            placeholder="输入名字..."
            maxLength={10}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <div className="creation-actions">
            <button className="creation-btn secondary" onClick={() => setStep('species')}>
              返回
            </button>
            <button
              className="creation-btn primary"
              disabled={!name.trim()}
              onClick={handleSubmit}
            >
              孵化！🥚
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetCreation;
