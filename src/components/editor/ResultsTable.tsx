import React, { useState, useMemo } from 'react';
import { ExecutionResponse } from '../../types/index.ts';
import { exportToCsv, exportToJson } from '../../utils/csvExport.ts';
import {
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Rows,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
} from 'lucide-react';

interface ResultsTableProps {
  result: ExecutionResponse | null;
  isExecuting: boolean;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ result, isExecuting }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);

  // Keep selected index in valid range
  const safeIndex = result?.results && result.results.length > 0
    ? Math.min(selectedResultIndex, result.results.length - 1)
    : 0;

  const currentResultItem = result?.results && result.results.length > 0 ? result.results[safeIndex] : null;
  const columns = currentResultItem?.columns || [];
  const rawValues = currentResultItem?.values || [];

  // Filter & Sort
  const processedRows = useMemo(() => {
    let rows = [...rawValues];

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      rows = rows.filter(row =>
        row.some(cell => String(cell).toLowerCase().includes(term))
      );
    }

    // Sort
    if (sortCol !== null && sortCol < columns.length) {
      rows.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return sortAsc ? -1 : 1;
        if (valB === null || valB === undefined) return sortAsc ? 1 : -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }

        const strA = String(valA);
        const strB = String(valB);
        return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return rows;
  }, [rawValues, searchTerm, sortCol, sortAsc, columns.length]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return processedRows.slice(start, start + pageSize);
  }, [processedRows, pageIndex, pageSize]);

  const handleSort = (index: number) => {
    if (sortCol === index) {
      if (sortAsc) setSortAsc(false);
      else {
        setSortCol(null);
        setSortAsc(true);
      }
    } else {
      setSortCol(index);
      setSortAsc(true);
    }
  };

  const handleCopyCell = (text: string, cellId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCell(cellId);
    setTimeout(() => setCopiedCell(null), 1500);
  };

  if (isExecuting) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-medium">Executing SQL statements...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">
        <Clock className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-xs font-medium">Write a SQL query above and click "Run Query" (⌘Enter).</p>
        <p className="text-[11px] text-slate-400 mt-1">Supports multi-statement scripts, CTEs, joins, and table creations.</p>
      </div>
    );
  }

  // Error State
  if (!result.success) {
    return (
      <div className="h-full p-4 overflow-y-auto bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200">
        <div className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-xl shadow-xs">
          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                SQL Execution Error
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                Stopped at failing statement
              </span>
            </div>
            <pre className="text-xs font-mono whitespace-pre-wrap text-rose-700 dark:text-rose-400 break-all bg-rose-50/80 dark:bg-rose-950/40 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30 leading-relaxed">
              {result.error}
            </pre>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              Tip: In multi-statement scripts, verify each statement ends with a semicolon (;) and references existing columns.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Multiple Result Sets Tab Bar (if query produced >1 result set) */}
      {result.results.length > 1 && (
        <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Result Sets:
          </span>
          {result.results.map((resItem, idx) => {
            const isTabActive = safeIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedResultIndex(idx);
                  setCurrentPage(1);
                  setSearchTerm('');
                  setSortCol(null);
                }}
                className={`px-3 py-1 rounded-md text-xs font-mono whitespace-nowrap shrink-0 transition-colors ${
                  isTabActive
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Result #{idx + 1}</span>
                <span className="ml-1.5 opacity-70">
                  ({resItem.statementType === 'SELECT' ? `${resItem.rowCount} rows` : `${resItem.rowsAffected ?? 0} affected`})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results Header Status Bar */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Stats */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Success</span>
          </span>

          <span className="text-slate-300 dark:text-slate-700">·</span>

          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{result.executionTimeMs}ms</span>
          </span>

          <span className="text-slate-300 dark:text-slate-700">·</span>

          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Rows className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">
              {currentResultItem?.statementType === 'SELECT'
                ? `${processedRows.length} ${processedRows.length === 1 ? 'row' : 'rows'}`
                : `${currentResultItem?.rowsAffected ?? 0} rows affected`}
            </span>
          </span>

          {result.results.length > 1 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-[11px] text-slate-500 font-mono">
                Showing set {safeIndex + 1} of {result.results.length}
              </span>
            </>
          )}

          {currentResultItem?.truncated && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Capped at 1,000 rows</span>
            </span>
          )}
        </div>

        {/* Right Search & Export Controls */}
        <div className="flex items-center gap-2">
          {columns.length > 0 && (
            <>
              {/* Quick Filter */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                <input
                  type="text"
                  placeholder="Filter results..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-6 pr-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-32 sm:w-44"
                />
              </div>

              {/* CSV Export */}
              <button
                onClick={() => exportToCsv('query_results', columns, processedRows)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 transition-colors"
                title="Export as CSV"
              >
                <Download className="w-3 h-3" />
                <span>CSV</span>
              </button>

              {/* JSON Export */}
              <button
                onClick={() => exportToJson('query_results', columns, processedRows)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 transition-colors"
                title="Export as JSON"
              >
                <span>JSON</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Table View */}
      {columns.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
          <h4 className="text-xs font-medium text-slate-800 dark:text-slate-200">
            Statement Executed Successfully
          </h4>
          <p className="text-[11px] mt-1 text-slate-500">
            {currentResultItem?.rowsAffected !== undefined
              ? `${currentResultItem.rowsAffected} row(s) modified.`
              : 'The query executed without producing tabular output rows.'}
          </p>
        </div>
      ) : paginatedRows.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <Search className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-xs">No records matched your search query.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs text-left">
            <thead className="bg-slate-100/90 dark:bg-slate-800/90 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 backdrop-blur-xs">
              <tr>
                <th className="w-10 px-3 py-2 text-[10px] font-mono text-slate-400 font-normal border-r border-slate-200 dark:border-slate-700 text-center select-none">
                  #
                </th>
                {columns.map((col, idx) => {
                  const isSorted = sortCol === idx;
                  return (
                    <th
                      key={col}
                      onClick={() => handleSort(idx)}
                      className="px-3 py-2 font-mono text-slate-700 dark:text-slate-200 font-semibold cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60 border-r border-slate-200 dark:border-slate-700 last:border-r-0 select-none transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{col}</span>
                        {isSorted ? (
                          sortAsc ? (
                            <ArrowUp className="w-3 h-3 text-indigo-500 shrink-0" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-indigo-500 shrink-0" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {paginatedRows.map((row, rIdx) => {
                const globalIndex = (pageIndex - 1) * pageSize + rIdx + 1;
                return (
                  <tr
                    key={rIdx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="w-10 px-3 py-1.5 text-[10px] text-slate-400 text-center select-none border-r border-slate-100 dark:border-slate-800/60 tabular-nums">
                      {globalIndex}
                    </td>
                    {row.map((cell, cIdx) => {
                      const isNum = typeof cell === 'number';
                      const cellKey = `${rIdx}-${cIdx}`;
                      const isNull = cell === null || cell === undefined;
                      const displayVal = isNull ? 'NULL' : String(cell);

                      return (
                        <td
                          key={cIdx}
                          onClick={() => handleCopyCell(displayVal, cellKey)}
                          title="Click to copy cell value"
                          className={`px-3 py-1.5 border-r border-slate-100 dark:border-slate-800/60 last:border-r-0 truncate max-w-xs group cursor-pointer transition-colors ${
                            isNum ? 'text-right tabular-nums' : 'text-left'
                          } ${isNull ? 'italic text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">{displayVal}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 transition-opacity">
                              {copiedCell === cellKey ? (
                                <Check className="w-2.5 h-2.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {columns.length > 0 && processedRows.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-slate-400">
              Showing {(pageIndex - 1) * pageSize + 1}–
              {Math.min(pageIndex * pageSize, processedRows.length)} of {processedRows.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={pageIndex <= 1}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono tabular-nums px-2">
              {pageIndex} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={pageIndex >= totalPages}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
