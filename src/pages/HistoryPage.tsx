import React, { useState } from 'react';
import { useHistory } from '../context/HistoryContext.tsx';
import { useDatabase } from '../context/DatabaseContext.tsx';
import {
  History,
  Star,
  Play,
  Trash2,
  Copy,
  Check,
  Search,
  Clock,
  Rows,
  CheckCircle2,
  XCircle,
  Database,
  BookmarkCheck,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const {
    history,
    deleteHistoryItem,
    clearHistory,
    savedQueries,
    deleteSavedQuery,
    saveQuery,
  } = useHistory();

  const { setEditorSql, setActivePage, switchDataset } = useDatabase();

  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (sql: string, id: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleRunInEditor = (sql: string, datasetId: string) => {
    switchDataset(datasetId);
    setEditorSql(sql);
    setActivePage('editor');
  };

  const filteredHistory = history.filter(item =>
    item.sql.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.datasetId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSaved = savedQueries.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.sql.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.notes && q.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span>Query History & Favorites</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review previously executed queries, diagnostic runtimes, and bookmark useful SQL snippets.
            </p>
          </div>

          {activeTab === 'history' && history.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all query execution history?')) clearHistory();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs hover:bg-rose-100 transition-colors self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Tab & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs self-start">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Execution Log</span>
              <span className="font-mono text-[10px] opacity-80">({history.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === 'saved'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Saved Queries</span>
              <span className="font-mono text-[10px] opacity-80">({savedQueries.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={activeTab === 'history' ? 'Search executed queries...' : 'Search saved queries...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Tab 1: Execution History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
                <History className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs font-medium">No query execution history found.</p>
                <p className="text-[11px] text-slate-400">
                  Queries you run in the SQL editor will automatically log here.
                </p>
              </div>
            ) : (
              filteredHistory.map(item => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  {/* Item Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {item.success ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Success</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Failed</span>
                        </span>
                      )}

                      <span className="text-slate-300 dark:text-slate-700">·</span>

                      <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                        <Database className="w-3 h-3" />
                        <span>{item.datasetId}</span>
                      </span>

                      <span className="text-slate-300 dark:text-slate-700">·</span>

                      <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                        {item.executionTimeMs}ms
                      </span>

                      <span className="text-slate-300 dark:text-slate-700">·</span>

                      <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                        {item.rowCount} rows
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* SQL Snippet */}
                  <pre className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto border border-slate-100 dark:border-slate-900">
                    {item.sql}
                  </pre>

                  {/* Error explanation if failed */}
                  {item.error && (
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded text-[11px] font-mono text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                      {item.error}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => saveQuery(`Query from ${new Date(item.timestamp).toLocaleDateString()}`, item.sql, item.datasetId)}
                      className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>Bookmark to Saved</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(item.sql, item.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Copy SQL"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => deleteHistoryItem(item.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleRunInEditor(item.sql, item.datasetId)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Saved Queries */}
        {activeTab === 'saved' && (
          <div className="space-y-3">
            {filteredSaved.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
                <Star className="w-8 h-8 mx-auto opacity-40 text-amber-500" />
                <p className="text-xs font-medium">No saved favorite queries yet.</p>
                <p className="text-[11px] text-slate-400">
                  Click the bookmark icon in the SQL editor toolbar to save queries here for quick access.
                </p>
              </div>
            ) : (
              filteredSaved.map(saved => (
                <div
                  key={saved.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {saved.title}
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        {saved.datasetId}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {new Date(saved.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {saved.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {saved.notes}
                    </p>
                  )}

                  <pre className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto border border-slate-100 dark:border-slate-900">
                    {saved.sql}
                  </pre>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleCopy(saved.sql, saved.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Copy SQL"
                    >
                      {copiedId === saved.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => deleteSavedQuery(saved.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete saved query"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleRunInEditor(saved.sql, saved.datasetId)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Open & Run</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
