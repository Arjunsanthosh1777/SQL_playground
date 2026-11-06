import React from 'react';
import { useDatabase } from '../../context/DatabaseContext.tsx';
import { useHistory } from '../../context/HistoryContext.tsx';
import {
  LayoutDashboard,
  Terminal,
  Trophy,
  TableProperties,
  History,
  Settings,
  ChevronRight,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const {
    activePage,
    setActivePage,
    activeDataset,
    schema,
    activeTable,
    setActiveTable,
    setEditorSql,
  } = useDatabase();

  const { completedChallenges } = useHistory();
  const totalChallenges = 18;
  const progressPercent = Math.min(100, Math.round((completedChallenges.length / totalChallenges) * 100));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'editor', label: 'SQL Editor', icon: Terminal },
    { id: 'challenges', label: 'Challenges', icon: Trophy, badge: `${completedChallenges.length}/${totalChallenges}` },
    { id: 'explorer', label: 'Database Explorer', icon: TableProperties },
    { id: 'history', label: 'Query History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTableClick = (tableName: string) => {
    const table = schema.find(t => t.name === tableName);
    if (table) setActiveTable(table);
    setEditorSql(`SELECT * FROM "${tableName}" LIMIT 25;`);
    setActivePage('editor');
  };

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Primary Navigation Links */}
      <div className="p-3 space-y-1">
        {navItems.map(item => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!collapsed && (
        <>
          {/* Learning Progress Section */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Curriculum Mastery</span>
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Active Dataset Tables Explorer */}
          <div className="flex-1 overflow-y-auto px-3 py-2 border-t border-slate-200 dark:border-slate-800">
            <div className="px-2 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Database className="w-3 h-3" />
                <span className="truncate">{activeDataset?.name || 'Database'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {schema.length} tables
              </span>
            </div>

            <div className="space-y-0.5">
              {schema.length === 0 ? (
                <div className="px-2 py-4 text-center text-xs text-slate-400">
                  Loading tables...
                </div>
              ) : (
                schema.map(table => {
                  const isSelected = activeTable?.name === table.name;
                  return (
                    <button
                      key={table.name}
                      onClick={() => handleTableClick(table.name)}
                      className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                        <span className="truncate font-mono text-[11px]">{table.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono tabular-nums opacity-80 group-hover:opacity-100">
                        {table.rowCount}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Isolated Sandbox</span>
            </span>
            <span className="font-mono text-[10px]">SQLite 3.45</span>
          </div>
        </>
      )}
    </aside>
  );
};
