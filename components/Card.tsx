import React from 'react';
import { CardData, CardType } from '../types';
import { Shield, Sword, Zap } from 'lucide-react';

interface CardProps {
  data: CardData;
  onClick?: () => void;
  disabled?: boolean;
  playable: boolean;
}

const Card: React.FC<CardProps> = ({ data, onClick, disabled, playable }) => {
  const getBorderColor = () => {
    switch (data.type) {
      case CardType.ATTACK: return 'border-red-500 bg-red-950/80';
      case CardType.SKILL: return 'border-blue-500 bg-blue-950/80';
      case CardType.POWER: return 'border-yellow-500 bg-yellow-950/80';
      default: return 'border-gray-500';
    }
  };

  const getIcon = () => {
    switch (data.type) {
      case CardType.ATTACK: return <Sword size={16} className="text-red-300" />;
      case CardType.SKILL: return <Shield size={16} className="text-blue-300" />;
      case CardType.POWER: return <Zap size={16} className="text-yellow-300" />;
      default: return null;
    }
  };

  return (
    <div 
      onClick={() => !disabled && playable && onClick?.()}
      className={`
        relative w-40 h-60 rounded-xl border-2 flex flex-col p-3 transition-all duration-200 select-none
        ${getBorderColor()}
        ${playable && !disabled ? 'cursor-pointer card-hover hover:border-white' : 'opacity-50 cursor-not-allowed grayscale'}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="bg-slate-900 rounded-full w-6 h-6 flex items-center justify-center border border-slate-600 text-blue-400 font-bold text-sm">
          {data.cost}
        </div>
        <div className="text-xs font-bold tracking-tighter text-slate-200 bg-black/50 px-1 rounded">
          {data.type}
        </div>
      </div>

      {/* Image / Icon Area (Placeholder) */}
      <div className="w-full h-20 bg-black/30 rounded mb-2 flex items-center justify-center border border-white/10">
         {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-white mb-1 leading-tight">{data.name}</h3>
        <p className="text-xs text-slate-300 mb-2 leading-tight">{data.description}</p>
        
        <div className="mt-auto">
          <p className="text-[10px] text-slate-500 italic border-t border-white/10 pt-1">
            "{data.flavor}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Card;