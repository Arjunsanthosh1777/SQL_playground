import React from 'react';
import { useDatabase } from '../context/DatabaseContext.tsx';
import { useHistory } from '../context/HistoryContext.tsx';
import {
  Terminal,
  Trophy,
  Database,
  History,
  Play,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    activeDataset,
    schema,
    setActivePage,
    setEditorSql,
    switchDataset,
  } = useDatabase();

  const { history, completedChallenges } = useHistory();

  const totalChallenges = 18;
  const progressPercent = Math.min(100, Math.round((completedChallenges.length / totalChallenges) * 100));

  const quickPrompts = [
    {
      title: 'Top 5 Students by GPA',
      dataset: 'students',
      sql: 'SELECT first_name, last_name, gpa, enrollment_year\nFROM students\nORDER BY gpa DESC\nLIMIT 5;',
    },
    {
      title: 'Executive Department Payroll',
      dataset: 'employees',
      sql: 'SELECT d.dept_name, COUNT(e.emp_id) AS staff_count, ROUND(AVG(e.salary), 2) AS avg_comp\nFROM departments d\nJOIN employees e ON d.dept_id = e.dept_id\nGROUP BY d.dept_name;',
    },
    {
      title: 'Products Needing Restock',
      dataset: 'products',
      sql: 'SELECT product_name, units_in_stock, reorder_level\nFROM products\nWHERE units_in_stock <= reorder_level;',
    },
    {
      title: 'High-Value Customer Orders',
      dataset: 'customers_orders',
      sql: 'SELECT c.first_name, c.last_name, o.order_id, o.total_amount\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nWHERE o.total_amount > 500\nORDER BY o.total_amount DESC;',
    },
  ];

  const handleLaunch = (sql: string, datasetId: string) => {
    switchDataset(datasetId);
    setEditorSql(sql);
    setActivePage('editor');
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Welcome Hero Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs relative overflow-hidden">
          <div className="max-w-2xl space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>Interactive SQL Learning Environment</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome to SQL Playground
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Execute live queries against fully-featured relational databases in an isolated SQLite WebAssembly sandbox. Solve graded challenges, inspect schema architectures, and analyze query executions.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActivePage('editor')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium shadow-sm transition-all"
              >
                <Terminal className="w-4 h-4" />
                <span>Open SQL Editor</span>
              </button>
              <button
                onClick={() => setActivePage('challenges')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Trophy className="w-4 h-4 text-indigo-500" />
                <span>Browse Challenges</span>
              </button>
            </div>
          </div>
        </div>

        {/* Diagnostic Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Curriculum Progress</span>
              <Trophy className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {completedChallenges.length} / {totalChallenges}
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Queries Executed</span>
              <History className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {history.length}
            </div>
            <p className="text-[11px] text-slate-400">
              {history.filter(h => h.success).length} successful runs
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Database</span>
              <Database className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {activeDataset?.name || 'Dataset'}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {schema.length} tables loaded
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Sandbox State</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Isolated & Safe</span>
            </div>
            <p className="text-[11px] text-slate-400">
              WebAssembly in-memory SQLite
            </p>
          </div>
        </div>

        {/* Quick Launch Queries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Quick Query Sandbox</span>
            </h2>
            <span className="text-xs text-slate-400">Click to load and execute instantly</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickPrompts.map((p, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {p.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                    {p.dataset}
                  </span>
                </div>

                <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg overflow-x-auto border border-slate-100 dark:border-slate-800">
                  {p.sql}
                </pre>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleLaunch(p.sql, p.dataset)}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
                  >
                    <span>Load in Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              <span>Recent Activity</span>
            </h2>
            <button
              onClick={() => setActivePage('history')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all history →
            </button>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No queries executed in this session yet. Open the SQL Editor to start practicing!
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
              {history.slice(0, 4).map(item => (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-4 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 truncate">
                    {item.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                        !
                      </span>
                    )}
                    <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                      {item.sql.replace(/\s+/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {item.executionTimeMs}ms
                    </span>
                    <button
                      onClick={() => handleLaunch(item.sql, item.datasetId)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                      title="Run query"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
