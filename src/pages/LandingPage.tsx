import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext.tsx';
import {
  Terminal,
  Trophy,
  Database,
  ShieldCheck,
  Zap,
  RotateCcw,
  Play,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActivePage, setEditorSql, switchDataset, executeQuery } = useDatabase();
  const [quickSql, setQuickSql] = useState(
    'SELECT first_name, last_name, gpa, enrollment_year\nFROM students\nWHERE gpa >= 3.80\nORDER BY gpa DESC;'
  );
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [isPreviewRunning, setIsPreviewRunning] = useState(false);

  const runLandingPreview = async () => {
    setIsPreviewRunning(true);
    try {
      const res = await executeQuery(quickSql);
      setPreviewResult(res);
    } finally {
      setIsPreviewRunning(false);
    }
  };

  const featureCards = [
    {
      icon: Database,
      title: 'Isolated Practice Sandboxes',
      description: 'Run real SQLite queries with complete safety. Test destructive statements like DROP, DELETE, or UPDATE without risking host environments.',
    },
    {
      icon: Trophy,
      title: 'Automated Query Verification',
      description: 'Solve 18+ structured challenges from beginner SELECTs to advanced window-like groupings, multi-way JOINs, and conditional CASE expressions.',
    },
    {
      icon: Layers,
      title: '4 Rich Relational Datasets',
      description: 'Explore realistic schemas with foreign keys and real constraints across Academic Students, Corporate HR, Retail Inventory, and E-Commerce Orders.',
    },
    {
      icon: ShieldCheck,
      title: 'Execution Telemetry & Safety',
      description: 'Precise execution time benchmarks in milliseconds, safety policy guardrails, query length limits, and detailed SQL syntax error reporting.',
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-linear-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer-grade SQL sandbox powered by SQLite WebAssembly</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
            Write, Execute & Master SQL With Real Relational Data
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            SQL Playground is an interactive educational developer tool for learning SQL. Experiment freely with real tables, solve auto-graded challenges, and inspect foreign key structures in zero-friction sandboxes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActivePage('editor')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch SQL Editor</span>
            </button>

            <button
              onClick={() => setActivePage('challenges')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <Trophy className="w-4 h-4 text-indigo-500" />
              <span>Explore Challenges</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Hero Sandbox Preview */}
        <div className="max-w-4xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-slate-500 dark:text-slate-400">
                live_sandbox_preview.sql — Students Database
              </span>
            </div>

            <button
              onClick={runLandingPreview}
              disabled={isPreviewRunning}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-xs transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isPreviewRunning ? 'Running...' : 'Run Query'}</span>
            </button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-400 mb-1 block">
                SQL Query (Editable)
              </label>
              <textarea
                value={quickSql}
                onChange={(e) => setQuickSql(e.target.value)}
                rows={5}
                className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase text-slate-400 mb-1">
                <span>Output Table</span>
                {previewResult && (
                  <span className="text-emerald-500 lowercase">
                    {previewResult.executionTimeMs}ms
                  </span>
                )}
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-2 overflow-auto max-h-36">
                {!previewResult ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Click "Run Query" to see live results
                  </div>
                ) : !previewResult.success ? (
                  <div className="text-xs text-rose-500 font-mono">
                    {previewResult.error}
                  </div>
                ) : previewResult.results[0] ? (
                  <table className="w-full text-[11px] font-mono text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                        {previewResult.results[0].columns.map((c: string) => (
                          <th key={c} className="p-1">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewResult.results[0].values.slice(0, 4).map((row: any[], i: number) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-900">
                          {row.map((cell, j) => (
                            <td key={j} className="p-1 truncate max-w-[100px]">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-xs text-slate-400">No rows returned.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-16 px-4 md:px-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Built for Modern Developers & Students
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Everything you need to move from basic SQL queries to advanced relational data engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureCards.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
