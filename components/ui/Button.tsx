import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading,
  className = '',
  ...props 
}) => {
  
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide";
  
  const variants = {
    primary: "bg-primary text-black hover:bg-[#D4D400] shadow-[0_0_15px_rgba(245,245,0,0.3)] hover:shadow-[0_0_25px_rgba(245,245,0,0.5)] border border-transparent",
    secondary: "bg-transparent border border-secondary text-secondary hover:bg-secondary/10 hover:shadow-[0_0_15px_rgba(138,92,246,0.3)]",
    glass: "bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-md",
    danger: "bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 rounded-lg",
    md: "text-sm px-5 py-2.5 rounded-xl",
    lg: "text-base px-6 py-3.5 rounded-xl"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
};
