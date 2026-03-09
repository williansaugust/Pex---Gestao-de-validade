import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  count: number;
  label: string;
  icon: LucideIcon;
  variant: 'theme' | 'red' | 'yellow' | 'green';
  onClick?: () => void;
  isActive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, label, icon: Icon, variant, onClick, isActive }) => {
  const variants = {
    theme: {
      gradient: 'from-theme-panel to-theme-bg hover:to-theme-panel',
      border: 'border-theme-accent/30',
      activeBorder: 'border-theme-accent',
      text: 'text-theme-accent',
      glow: 'shadow-[0_0_30px_var(--accent-glow)]',
      iconBg: 'bg-theme-accent/10 text-theme-accent',
      watermark: 'text-theme-accent opacity-5'
    },
    red: {
      gradient: 'from-[#550c0c]/80 to-[#450a0a]/80 hover:to-[#550c0c]/90',
      border: 'border-red-500/30',
      activeBorder: 'border-red-500',
      text: 'text-red-500',
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
      iconBg: 'bg-red-500/10 text-red-500',
      watermark: 'text-red-500/5'
    },
    yellow: {
      gradient: 'from-theme-panel to-theme-bg hover:to-theme-panel', // Transparente como o primeito bloco
      border: 'border-[#EAFF00]/50',
      activeBorder: 'border-[#EAFF00]',
      text: 'text-[#FFFF00]', // Amarelo Vivo
      glow: 'shadow-[0_0_35px_rgba(234,255,0,0.5)]',
      iconBg: 'bg-[#FFFF00]/10 text-[#FFFF00]',
      watermark: 'text-[#FFFF00]/10'
    },
    green: {
      gradient: 'from-theme-panel to-theme-bg hover:to-theme-panel', // Transparente como o primeito bloco
      border: 'border-[#adff2f]/50', // Verde Claro (GreenYellow)
      activeBorder: 'border-[#adff2f]',
      text: 'text-[#adff2f]', // Verde Claro Vibrante
      glow: 'shadow-[0_0_35px_rgba(173,255,47,0.4)]',
      iconBg: 'bg-[#adff2f]/10 text-[#adff2f]',
      watermark: 'text-[#adff2f]/10'
    },
  };

  const style = variants[variant];
  const hasItems = count > 0;

  // Condições Visuais
  const isExpired = variant === 'red' && hasItems;      // Vencidos -> Piscar
  const isCritical = variant === 'yellow' && hasItems;  // Críticos -> Aceso (Brilho constante)

  return (
    <div
      onClick={onClick}
      className={`
        relative p-3 rounded-xl transition-all duration-500 cursor-pointer overflow-hidden group
        bg-gradient-to-br backdrop-blur-sm border
        ${style.gradient}
        
        ${/* Lógica de Borda e Escala Ativa/Hover */ ''}
        ${isActive
          ? `${style.activeBorder} ring-1 ring-${variant}-500/50 shadow-2xl scale-[1.02] z-10`
          : `${style.border} hover:border-${variant}-500/50 hover:scale-[1.01]`
        }

        ${/* EFEITO PISCAR PARA VENCIDOS */ ''}
        ${isExpired
          ? 'animate-[pulse_1.5s_ease-in-out_infinite] border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.5)] ring-1 ring-red-500/30'
          : ''
        }

        ${/* EFEITO ACESO PARA CRÍTICOS */ ''}
        ${isCritical && !isActive
          ? 'border-[#EAFF00]/80 shadow-[0_0_25px_rgba(234,255,0,0.5)] ring-1 ring-[#EAFF00]/30'
          : ''
        }

        ${/* Brilho Padrão se não for caso especial */ ''}
        ${!isExpired && !isCritical ? style.glow : ''}
      `}
    >
      {/* Header Row */}
      <div className="flex justify-between items-start mb-2 relative z-20">
        <span className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${isActive || isCritical || isExpired ? (variant === 'green' ? 'text-[#adff2f]' : variant === 'yellow' ? 'text-[#FFFF00]' : 'text-white') : 'text-gray-400 group-hover:text-gray-300'}`}>
          {title}
        </span>

        <div className={`p-1.5 rounded-lg border border-white/5 transition-all duration-300 ${isActive || isCritical || isExpired ? (variant === 'green' ? 'bg-[#adff2f]/10 text-[#adff2f] shadow-[0_0_10px_rgba(173,255,47,0.3)]' : variant === 'yellow' ? 'bg-[#FFFF00]/10 text-[#FFFF00] shadow-[0_0_10px_rgba(255,255,0,0.3)]' : 'bg-white/10 text-white shadow-inner') : style.iconBg}`}>
          <Icon size={15} className={isActive || isCritical || isExpired ? 'drop-shadow-sm' : ''} />
        </div>
      </div>

      {/* Count Row */}
      <div className="relative z-20 flex items-baseline gap-2 mt-0.5">
        <span className={`text-3xl font-black tracking-tight ${isExpired ? 'text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
          (isCritical ? 'text-[#FFFF00] drop-shadow-[0_0_12px_rgba(255,255,0,0.6)]' :
            (isActive && variant === 'green' ? 'text-[#013220] drop-shadow-[0_0_8px_rgba(1,50,32,0.4)]' :
              (isActive && variant === 'yellow' ? 'text-[#FFFF00] drop-shadow-[0_0_12px_rgba(255,255,0,0.6)]' : style.text)))
          }`}>
          {count}
        </span>
        <span className={`text-[9px] font-bold tracking-widest uppercase mb-0.5 ${isActive || isCritical || isExpired ? (variant === 'green' ? 'text-[#013220]/70' : variant === 'yellow' ? 'text-[#FFFF00]/70' : 'text-white/70') : 'text-gray-600'}`}>
          {label}
        </span>
      </div>

      {/* Decorative Watermark */}
      <Icon
        className={`absolute -bottom-4 -right-4 w-24 h-24 ${style.watermark} transform rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 z-0 pointer-events-none`}
      />

      {/* Glossy Overlay for Active/Alert States */}
      {(isActive || isCritical || isExpired) && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none rounded-2xl" />
      )}
    </div>
  );
};

export default StatCard;