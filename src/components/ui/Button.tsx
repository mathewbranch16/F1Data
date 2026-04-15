import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ 
  children, 
  className = '', 
  variant = 'primary', 
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-bold tracking-wide transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-[44px] px-6 py-2";
  
  const variants = {
    primary: "bg-gradient-to-br from-primary to-primary-container text-surface-low hover:brightness-110 shadow-[0_0_15px_rgba(79,245,223,0.2)] hover:shadow-[0_0_25px_rgba(79,245,223,0.4)]",
    secondary: "bg-transparent text-primary hover:bg-primary/5 border border-outline-variant",
    ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
