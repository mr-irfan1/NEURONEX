import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'primary' | 'secondary' | 'none';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'none',
  interactive = false,
  ...props
}) => {
  const baseStyle = "glass-panel rounded-2xl p-6 transition-all duration-300 relative overflow-hidden";
  
  const glows = {
    primary: "hover:border-primary/50 hover:shadow-[0_0_30px_rgba(245,245,0,0.15)]",
    secondary: "hover:border-secondary/50 hover:shadow-[0_0_30px_rgba(138,92,246,0.15)]",
    none: "border-white/5"
  };

  const interactiveStyle = interactive ? "cursor-pointer hover:-translate-y-1" : "";

  return (
    <div 
        className={`${baseStyle} ${glows[glowColor]} ${interactiveStyle} ${className}`}
        {...props}
    >
      {children}
    </div>
  );
};