import { cn } from '../../lib/utils';
import LogoIcon from '../../assets/logo_icon.svg';
import LogoText from '../../assets/logo_text.svg';

interface LogoProps {
  /** Height of the logo container */
  height?: string;
  /** Width of the logo container */
  width?: string;
  /** Show only icon (no text) */
  iconOnly?: boolean;
  /** Show only text (no icon) */
  textOnly?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Spacing between icon and text */
  gap?: 'sm' | 'md' | 'lg';
  /** Vertical alignment of logo elements */
  align?: 'start' | 'center' | 'end';
}

export function Logo({
  height = 'h-8',
  width = 'w-auto',
  iconOnly = false,
  textOnly = false,
  className,
  gap = 'md',
  align = 'center'
}: LogoProps) {
  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end'
  };

  // If both iconOnly and textOnly are true, show both (fallback)
  const showIcon = !textOnly;
  const showText = !iconOnly;

  return (
    <div className={cn(
      'flex',
      gapClasses[gap],
      alignClasses[align],
      height,
      width,
      className
    )}>
      {showIcon && (
        <img
          src={LogoIcon}
          alt="Logo Icon"
          className={cn(
            'flex-shrink-0',
            height,
            'w-auto'
          )}
        />
      )}
      {showText && (
        <img
            src={LogoText}
            alt="Logo Text"
            className={cn(
            'flex-shrink-0 w-auto',
            height,
            'h-[calc(theme(height.5))]'
            )}/>
        )}
    </div>
  );
}