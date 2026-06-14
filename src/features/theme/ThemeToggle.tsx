import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему';

  return (
    <button
      className={`theme-toggle ${compact ? 'theme-toggle-compact' : ''} ${className}`.trim()}
      type="button"
      aria-label={nextThemeLabel}
      title={nextThemeLabel}
      onClick={toggleTheme}
    >
      {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
      {!compact && <span>{theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}</span>}
    </button>
  );
}
