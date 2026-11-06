import React from 'react';
import { useDatabase } from '../../context/DatabaseContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { Database, RotateCcw, Sun, Moon, Sparkles, BookOpen, Terminal, History, Search } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    datasets,
    activeDatasetId,
    switchDataset,
    resetCurrentDataset,
    isResetting,
    activePage,
    setActivePage,
  } = useDatabase();

  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
    { id: 'editor', label: 'SQL Editor', icon: Terminal },
    { id: 'challenges', label: 'Challenges', icon: BookOpen },
    { id: 'explorer', label: 'Explorer', icon: Search },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between gap-8">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <button
        onClick={() => setActivePage('landing')}
        className="flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
      >
        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
          <Database className="w-4 h-4" />
        </div>
        <span>SQL PLAYGROUND</span>
      </button>

      {/* Zone 2: 4–5 clean single-line nav links */}
      <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
        {navLinks.map(link => {
          const isActive = activePage === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActivePage(link.id)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 Primary Action Area with Dataset Selector, Reset, and Theme Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Dataset Selector Dropdown */}
        <div className="relative flex items-center">
          <select
            value={activeDatasetId}
            onChange={(e) => switchDataset(e.target.value)}
            className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-nowrap cursor-pointer transition-colors"
            title="Switch active sample database"
          >
            {datasets.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Database Reset Button */}
        <button
          onClick={resetCurrentDataset}
          disabled={isResetting}
          title="Reset database to pristine seed state"
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setActivePage('settings')}
          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
            activePage === 'settings'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Settings
        </button>
      </div>
    </header>
  );
};
