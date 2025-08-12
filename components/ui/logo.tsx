import Image from 'next/image';

interface LogoProps {
  variant?: 'default' | 'white' | 'colored';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'nav';
  className?: string;
}

export function Logo({ variant = 'default', size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
    '2xl': 'h-16 w-16',
    '3xl': 'h-20 w-20',
    '4xl': 'h-24 w-24',
    '5xl': 'h-28 w-28',
    '6xl': 'h-32 w-32',
    '7xl': 'h-52 w-52',
    'nav': 'h-14 w-14' // Special size for navbar - larger than lg but fits navbar height
  };

  const logoVariants = {
    default: '/assets/images/logos/eddura-logo-main.png',
    white: '/assets/images/logos/eddura-logo-white.png',
    colored: '/assets/images/logos/eddura-logo-main.png'
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <Image
        src={logoVariants[variant]}
        alt="Eddura Logo"
        width={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : size === 'xl' ? 48 : size === '2xl' ? 64 : size === '3xl' ? 80 : size === 'nav' ? 56 : 48}
        height={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : size === 'xl' ? 48 : size === '2xl' ? 64 : size === '3xl' ? 80 : size === 'nav' ? 56 : 48}
        className={`${sizeClasses[size]} object-contain`}
        priority
      />
    </div>
  );
}

// Simple logo for cases where we don't need Next.js Image optimization
export function SimpleLogo({ variant = 'default', size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
    '2xl': 'h-16 w-16',
    '3xl': 'h-20 w-20',
    '4xl': 'h-24 w-24',
    '5xl': 'h-28 w-28',
    '6xl': 'h-32 w-32',
    '7xl': 'h-52 w-52',
    'nav': 'h-14 w-14' // Special size for navbar - larger than lg but fits navbar height
  };

  const logoVariants = {
    default: '/assets/images/logos/eddura-logo-main.png',
    white: '/assets/images/logos/eddura-logo-white.png',
    colored: '/assets/images/logos/eddura-logo-main.png'
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <Image
        src={logoVariants[variant]}
        alt="Eddura Logo"
        width={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : size === 'xl' ? 48 : size === '2xl' ? 64 : size === '3xl' ? 80 : size === 'nav' ? 56 : 48}
        height={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : size === 'xl' ? 48 : size === '2xl' ? 64 : size === '3xl' ? 80 : size === 'nav' ? 56 : 48}
        className={`${sizeClasses[size]} object-contain`}
        priority
      />
    </div>
  );
}

// Theme-aware logo that automatically switches based on current theme
export function ThemeAwareLogo({ size = 'md', className = '' }: Omit<LogoProps, 'variant'>) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
    '2xl': 'h-16 w-16',
    '3xl': 'h-20 w-20',
    '4xl': 'h-24 w-24',
    '5xl': 'h-28 w-28',
    '6xl': 'h-32 w-32',
    '7xl': 'h-52 w-52',
    'nav': 'h-16 w-16' // Special size for navbar - larger than lg but fits navbar height
  };

  const logoVariants = {
    default: '/assets/images/logos/eddura-logo-main.png',
    white: '/assets/images/logos/eddura-logo-white.png'
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Light mode logo (default) */}
      <Image
        src={logoVariants.default}
        alt="Eddura Logo"
        width={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : size === 'xl' ? 48 : size === '2xl' ? 64 : size === '3xl' ? 80 : size === 'nav' ? 56 : 48}
        height={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : size === 'xl' ? 48 : size === '2xl' ? 64 : size === '3xl' ? 80 : size === 'nav' ? 56 : 48}
        className={`${sizeClasses[size]} object-contain dark:hidden`}
        priority
      />
      {/* Dark mode logo (white) */}
      <Image
        src={logoVariants.white}
        alt="Eddura Logo"
        width={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : size === 'xl' ? 48 : size === '2xl' ? 64 : size === '3xl' ? 80 : size === 'nav' ? 56 : 48}
        height={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 40 : size === 'xl' ? 48 : size === '2xl' ? 64 : size === '3xl' ? 80 : size === 'nav' ? 56 : 48}
        className={`${sizeClasses[size]} object-contain hidden dark:block`}
        priority
      />
    </div>
  );
}
