import React, { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext.tsx';
import { TableSchema, ExecutionResponse } from '../types/index.ts';
import {
  TableProperties,
  Key,
  Link,
  Terminal,
  Search,
  Database,
  Layers,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

export const ExplorerPage: React.FC = () => {
  const {
    datasets,
    activeDatasetId,
    activeDataset,
    switchDataset,
    schema,
    activeTable,
    setActiveTable,
    setEditorSql,
    setActivePage,
    resetCurrentDataset,
    isResetting,
  } = useDatabase();

  const [tableData, setTableData] = useState<ExecutionResponse | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Selected table
  const selectedTable = activeTable || schema[0] || null;

  useEffect(() => {
    if (!selectedTable) return;
    setIsLoadingData(true);
    fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        datasetId: activeDatasetId,
        sql: `SELECT * FROM "${selectedTable.name}" LIMIT 50;`,
      }),
    })
      .then(res => res.json())
      .then(data => setTableData(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoadingData(false));
  }, [selectedTable, activeDatasetId]);

  const handleQueryTable = (tableName: string) => {
    setEditorSql(`SELECT * FROM "${tableName}" LIMIT 25;`);
    setActivePage('editor');
  };

  const currentResult = tableData?.results?.[0];
  const columns = currentResult?.columns || [];
  const rows = currentResult?.values || [];

  const filteredRows = rows.filter(row =>
    searchFilter.trim() === ''
      ? true
      : row.some(cell => String(cell).toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header & Dataset Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span>Database Schema Explorer</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Inspect relational table structures, data types, primary & foreign keys, and live sample rows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetCurrentDataset}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Database</span>
            </button>
          </div>
        </div>

        {/* Dataset Switcher Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {datasets.map(d => {
            const isActive = d.id === activeDatasetId;
            return (
              <button
                key={d.id}
                onClick={() => switchDataset(d.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 shadow-xs'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {d.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {d.tagline}
                </p>
                <div className="text-[10px] text-slate-400 font-mono mt-2">
                  {d.tables.length} tables
                </div>
              </button>
            );
          })}
        </div>

        {/* Master-Detail Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Table List Column */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tables in {activeDataset?.name} ({schema.length})
            </h3>

            <div className="space-y-1.5">
              {schema.map(table => {
                const isSelected = selectedTable?.name === table.name;
                return (
                  <button
                    key={table.name}
                    onClick={() => setActiveTable(table)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-indigo-600 dark:border-indigo-500 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <TableProperties className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      <div>
                        <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white block truncate">
                          {table.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {table.columns.length} columns
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {table.rowCount} rows
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Details & Live Records Column */}
          <div className="lg:col-span-8 space-y-5">
            {selectedTable && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xs">
                {/* Detail Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                        {selectedTable.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        {selectedTable.rowCount} total records
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Relational schema and column constraints
                    </p>
                  </div>

                  <button
                    onClick={() => handleQueryTable(selectedTable.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shrink-0"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Query in Editor</span>
                  </button>
                </div>

                {/* Column Schema Definition */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Columns Definition
                  </h4>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
                    <table className="w-full text-xs font-mono text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-3 py-2">Column</th>
                          <th className="px-3 py-2">Type</th>
                          <th className="px-3 py-2">Constraints</th>
                          <th className="px-3 py-2">Foreign Key</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {selectedTable.columns.map(col => {
                          const fk = selectedTable.foreignKeys.find(f => f.column === col.name);
                          return (
                            <tr key={col.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                {col.isPrimaryKey && (
                                  <span title="Primary Key"><Key className="w-3 h-3 text-amber-500" /></span>
                                )}
                                <span>{col.name}</span>
                              </td>
                              <td className="px-3 py-2 text-indigo-600 dark:text-indigo-400">
                                {col.type}
                              </td>
                              <td className="px-3 py-2 text-slate-500">
                                {col.isPrimaryKey ? 'PRIMARY KEY' : col.notNull ? 'NOT NULL' : 'NULLABLE'}
                              </td>
                              <td className="px-3 py-2 text-blue-500 flex items-center gap-1">
                                {fk ? (
                                  <>
                                    <Link className="w-3 h-3" />
                                    <span>
                                      {fk.foreignTable}.{fk.foreignColumn}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-700">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Live Data Preview */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Live Data Preview (First 50 records)
                    </h4>
                    <div className="relative">
                      <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="pl-6 pr-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36 sm:w-48"
                      />
                    </div>
                  </div>

                  {isLoadingData ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Loading table records...
                    </div>
                  ) : columns.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No records found in this table.
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto max-h-72">
                      <table className="w-full text-xs font-mono text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            {columns.map(col => (
                              <th key={col} className="px-3 py-1.5 whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                          {filteredRows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                                  {cell === null ? 'NULL' : String(cell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
