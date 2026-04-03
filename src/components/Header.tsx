import React from 'react';
import { DollarSign, Clock, TrendingUp, Sun, Moon, Plus, Globe, BarChart3, Kanban } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTimer, formatTime } from '@/hooks/useTimer';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onAddTask?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddTask }) => {
  const { state, dispatch, getTotalRevenue } = useApp();
  const { activeTaskId, elapsed } = useTimer();
  const { language, setLanguage, t } = useLanguage();

  const activeTask = activeTaskId ? state.tasks.find(t => t.id === activeTaskId) : null;
  const totalRevenue = getTotalRevenue();
  const totalBillableHours = state.tasks
    .filter(t => t.isBillable)
    .reduce((sum, t) => sum + t.timeSpent, 0) / 3600;

  const navLinkBase = 'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-2 py-1';
  const navLinkActive = 'text-foreground font-bold border-b-2 border-primary';

  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Clock className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="font-bold text-lg hidden sm:block">FreelanceFlow</h1>
        </div>

        <nav className="flex items-center gap-1" aria-label="Main">
          <NavLink
            to="/"
            className={navLinkBase}
            activeClassName={navLinkActive}
            end
          >
            <Kanban className="h-4 w-4 sm:hidden" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{t.boardNavLink}</span>
          </NavLink>
          <NavLink
            to="/earnings"
            className={navLinkBase}
            activeClassName={navLinkActive}
          >
            <BarChart3 className="h-4 w-4 sm:hidden" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{t.earningsNavLink}</span>
          </NavLink>
        </nav>

        {activeTask && onAddTask && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-timer-muted rounded-full">
            <div className="w-2 h-2 bg-timer rounded-full animate-pulse-gentle" />
            <span className="text-sm font-medium truncate max-w-32">
              {activeTask.title}
            </span>
            <span className="font-mono text-sm text-timer font-semibold">
              {formatTime(activeTask.timeSpent + elapsed)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {onAddTask && (
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <DollarSign className="h-4 w-4 text-revenue" />
              <span className="text-muted-foreground">{t.totalRevenue}:</span>
              <span className="font-semibold text-revenue">${totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t.billableHours}:</span>
              <span className="font-semibold">{totalBillableHours.toFixed(1)}h</span>
            </div>
          </div>
        )}

        {onAddTask && (
          <Button onClick={onAddTask} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{t.addTask}</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setLanguage('en')}
              className={language === 'en' ? 'bg-accent' : ''}
            >
              🇺🇸 {t.english}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLanguage('pt')}
              className={language === 'pt' ? 'bg-accent' : ''}
            >
              🇧🇷 {t.portuguese}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
        >
          {state.isDarkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
