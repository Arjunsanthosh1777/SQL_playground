import React, { useState } from 'react';
import { useHistory } from '../context/HistoryContext.tsx';
import { useDatabase } from '../context/DatabaseContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import {
  Settings,
  Type,
  Moon,
  Sun,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Shield,
  Layers,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { userSettings, updateSettings, resetSessionId, clearHistory } = useHistory();
  const { datasets, resetCurrentDataset, isResetting } = useDatabase();
  const { theme, toggleTheme } = useTheme();

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const showSaved = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleResetSession = () => {
    resetSessionId();
    showSaved('New isolated sandbox session generated.');
  };

  const handleClearAllStorage = () => {
    if (window.confirm('Clear all history, challenge progress, and saved queries from local browser storage?')) {
      localStorage.removeItem('sql_playground_history');
      localStorage.removeItem('sql_playground_saved_queries');
      localStorage.removeItem('sql_playground_completed_challenges');
      window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>User & Editor Settings</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure code editor behavior, appearance preferences, and sandbox isolation sessions.
          </p>
        </div>

        {savedNotice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* Section 1: Editor Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Type className="w-4 h-4 text-indigo-500" />
            <span>Editor Typography & Display</span>
          </h3>

          {/* Font Size */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Editor Font Size
              </span>
              <span className="text-slate-400 text-[11px]">
                Adjust CodeMirror font scale ({userSettings.fontSize || 14}px)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={12}
                max={20}
                step={1}
                value={userSettings.fontSize || 14}
                onChange={(e) => {
                  updateSettings({ fontSize: Number(e.target.value) });
                }}
                className="w-28 cursor-pointer accent-indigo-600"
              />
              <span className="font-mono text-slate-600 dark:text-slate-300 w-8 text-right">
                {userSettings.fontSize || 14}px
              </span>
            </div>
          </div>

          {/* Line Numbers Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Show Line Numbers
              </span>
              <span className="text-slate-400 text-[11px]">
                Display gutter line numbering in the SQL editor
              </span>
            </div>
            <button
              onClick={() => updateSettings({ lineNumbers: !userSettings.lineNumbers })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                userSettings.lineNumbers ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  userSettings.lineNumbers ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Color Theme */}
          <div className="flex items-center justify-between py-2 text-xs">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Interface Color Theme
              </span>
              <span className="text-slate-400 text-[11px]">
                Current theme is {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="capitalize">{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Sandbox Isolation & Database */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            <span>Sandbox Isolation & State</span>
          </h3>

          {/* Session ID */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Session Isolation Key
              </span>
              <span className="text-slate-400 text-[11px]">
                Each session has isolated in-memory tables and mutation state
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px] text-slate-700 dark:text-slate-300">
                {userSettings.sessionId}
              </code>
              <button
                onClick={handleResetSession}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 text-xs transition-colors"
                title="Generate fresh session ID"
              >
                <RefreshCw className="w-3 h-3" />
                <span>New Session</span>
              </button>
            </div>
          </div>

          {/* Reset Active Database */}
          <div className="flex items-center justify-between py-2 text-xs">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                Reset Active Sandbox Dataset
              </span>
              <span className="text-slate-400 text-[11px]">
                Re-seeds the current database back to original sample data
              </span>
            </div>
            <button
              onClick={resetCurrentDataset}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset to Seed</span>
            </button>
          </div>
        </div>

        {/* Section 3: Data Management */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-950 p-5 space-y-3 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Danger Zone & Reset</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clear your local browser cache of query execution history, saved favorite queries, and challenge achievements.
          </p>
          <div className="pt-2">
            <button
              onClick={handleClearAllStorage}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Clear Local Storage & Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
