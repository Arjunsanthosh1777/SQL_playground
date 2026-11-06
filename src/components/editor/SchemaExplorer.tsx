import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext.tsx';
import { TableSchema } from '../../types/index.ts';
import {
  TableProperties,
  Key,
  Link,
  ChevronDown,
  ChevronRight,
  Database,
  Terminal,
  Eye,
  Rows,
} from 'lucide-react';

export const SchemaExplorer: React.FC = () => {
  const { schema, activeDataset, setEditorSql, editorSql } = useDatabase();
  const [expandedTable, setExpandedTable] = useState<string | null>(schema[0]?.name || null);
  const [previewTable, setPreviewTable] = useState<TableSchema | null>(null);

  const toggleTable = (name: string) => {
    setExpandedTable(prev => (prev === name ? null : name));
  };

  const insertColumn = (colName: string) => {
    setEditorSql(editorSql + (editorSql.trim().endsWith(',') || editorSql.trim() === '' ? ` ${colName}` : `, ${colName}`));
  };

  const queryTable = (tableName: string) => {
    setEditorSql(`SELECT * FROM "${tableName}" LIMIT 25;`);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-y-auto">
      {/* Schema Header */}
      <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {activeDataset?.name || 'Database Schema'}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {schema.length} tables
        </span>
      </div>

      {/* Tables Accordion List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto">
        {schema.map(table => {
          const isExpanded = expandedTable === table.name;
          return (
            <div key={table.name} className="transition-colors">
              {/* Table Header Bar */}
              <div
                onClick={() => toggleTable(table.name)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 truncate">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <TableProperties className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="font-semibold truncate">{table.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                    {table.rowCount} rows
                  </span>

                  {/* Quick Query Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      queryTable(table.name);
                    }}
                    title="Insert SELECT * query"
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"
                  >
                    <Terminal className="w-3 h-3" />
                  </button>

                  {/* Sample Preview Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTable(table);
                    }}
                    title="Preview first 3 rows"
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Expanded Columns List */}
              {isExpanded && (
                <div className="bg-slate-50/70 dark:bg-slate-950/40 px-3 py-2 space-y-1 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                  {table.columns.map(col => {
                    const fk = table.foreignKeys.find(f => f.column === col.name);
                    return (
                      <div
                        key={col.name}
                        onClick={() => insertColumn(col.name)}
                        className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer group"
                        title="Click to append column to query"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {col.isPrimaryKey ? (
                            <span title="Primary Key"><Key className="w-3 h-3 text-amber-500 shrink-0" /></span>
                          ) : fk ? (
                            <span title={`Foreign Key: ${fk.foreignTable}.${fk.foreignColumn}`}><Link className="w-3 h-3 text-blue-500 shrink-0" /></span>
                          ) : (
                            <div className="w-3 h-3 shrink-0" />
                          )}
                          <span className="font-mono text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {col.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] shrink-0 font-mono">
                          <span className="text-slate-400">{col.type}</span>
                          {col.notNull && (
                            <span className="text-slate-500 dark:text-slate-400 opacity-60">
                              NOT NULL
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Row Sample Modal */}
      {previewTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rows className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                  {previewTable.name} (First 3 sample records)
                </h3>
              </div>
              <button
                onClick={() => setPreviewTable(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close ✕
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {previewTable.columns.map(c => (
                      <th key={c.name} className="px-2.5 py-1.5 whitespace-nowrap">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {previewTable.sampleRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-2.5 py-1 whitespace-nowrap">
                          {cell === null ? 'NULL' : String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  queryTable(previewTable.name);
                  setPreviewTable(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Open in SQL Editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
