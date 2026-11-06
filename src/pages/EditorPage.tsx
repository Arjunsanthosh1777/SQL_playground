import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext.tsx';
import { SqlEditor } from '../components/editor/SqlEditor.tsx';
import { ResultsTable } from '../components/editor/ResultsTable.tsx';
import { SchemaExplorer } from '../components/editor/SchemaExplorer.tsx';
import { ExecutionResponse } from '../types/index.ts';
import {
  Columns,
  TableProperties,
  Info,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';

export const EditorPage: React.FC = () => {
  const { editorSql, executeQuery, statusMessage, activeDataset } = useDatabase();
  const [result, setResult] = useState<ExecutionResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'schema' | 'info'>('results');
  
  // Resizable split percentage (height or width)
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleExecute = async () => {
    if (!editorSql.trim()) return;
    setIsExecuting(true);
    try {
      const res = await executeQuery(editorSql);
      setResult(res);
      setActiveTab('results');
    } finally {
      setIsExecuting(false);
    }
  };

  // Drag divider logic
  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const newPercent = (relativeY / rect.height) * 100;
      if (newPercent >= 20 && newPercent <= 80) {
        setSplitPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toast Alert for database resets */}
      {statusMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Main Split Layout Container */}
      <div ref={containerRef} className="flex-1 flex flex-col min-h-0 relative select-none">
        {/* Top Pane: SQL Code Editor */}
        <div style={{ height: `${splitPercent}%` }} className="min-h-0 flex flex-col">
          <SqlEditor onExecute={handleExecute} isExecuting={isExecuting} />
        </div>

        {/* Resizer Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="h-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-indigo-500 dark:hover:bg-indigo-500 cursor-row-resize transition-colors flex items-center justify-center shrink-0 group relative z-20"
        >
          <div className="w-10 h-0.5 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white" />
        </div>

        {/* Bottom Pane: Results & Explorer Tabs */}
        <div
          style={{ height: `${100 - splitPercent}%` }}
          className="min-h-0 flex flex-col bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
        >
          {/* Bottom Tabs Bar */}
          <div className="h-9 px-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('results')}
                className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'results'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Query Results</span>
                {result?.success && result.results[0] && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    ({result.results[0].statementType === 'SELECT' ? `${result.results[0].rowCount} rows` : 'Done'})
                  </span>
                )}
                {result && !result.success && (
                  <span className="text-[10px] font-mono text-rose-500 font-semibold">
                    (Error)
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('schema')}
                className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'schema'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>Table Schema</span>
              </button>

              <button
                onClick={() => setActiveTab('info')}
                className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === 'info'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Execution Details</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Database: <span className="text-slate-600 dark:text-slate-300">{activeDataset?.name}</span>
            </div>
          </div>

          {/* Tab Content Panes */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === 'results' && (
              <ResultsTable result={result} isExecuting={isExecuting} />
            )}

            {activeTab === 'schema' && (
              <SchemaExplorer />
            )}

            {activeTab === 'info' && (
              <div className="h-full p-4 overflow-y-auto text-xs space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-500" />
                    <span>Runtime Environment & Query Diagnostics</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Engine</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">SQLite 3.45 WebAssembly</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Isolation</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Session Sandbox</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Last Execution</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
                        {result ? `${result.executionTimeMs} ms` : 'None'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Safety Restrictions</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Strict Sandboxing Enabled</span>
                    </div>
                  </div>

                  {result?.warnings && result.warnings.length > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg text-amber-800 dark:text-amber-300 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Execution Warnings</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] space-y-0.5">
                        {result.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-2">
                    <p>• Queries run in an in-memory, completely isolated clone of the database.</p>
                    <p>• You can run DDL/DML statements (`CREATE`, `INSERT`, `UPDATE`, `DELETE`) safely.</p>
                    <p>• Click the Reset button in the top bar anytime to restore tables to their original sample seed data.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
