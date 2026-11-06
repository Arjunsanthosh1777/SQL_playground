import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { useDatabase } from '../../context/DatabaseContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useHistory } from '../../context/HistoryContext.tsx';
import {
  Play,
  Trash2,
  Copy,
  Check,
  BookmarkPlus,
  Sparkles,
  Command,
} from 'lucide-react';

interface SqlEditorProps {
  onExecute: () => void;
  isExecuting: boolean;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({ onExecute, isExecuting }) => {
  const { editorSql, setEditorSql, activeDatasetId, datasets } = useDatabase();
  const { theme } = useTheme();
  const { userSettings, saveQuery } = useHistory();
  const [copied, setCopied] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveNotes, setSaveNotes] = useState('');

  // Sample templates for quick insertion
  const sampleTemplates = [
    {
      label: 'SELECT * FROM table',
      sql: `SELECT * \nFROM ${activeDatasetId === 'students' ? 'students' : activeDatasetId === 'employees' ? 'employees' : activeDatasetId === 'products' ? 'products' : 'customers'}\nLIMIT 10;`,
    },
    {
      label: 'WHERE Condition & Filter',
      sql: `SELECT * \nFROM ${activeDatasetId === 'students' ? 'students WHERE gpa >= 3.80' : activeDatasetId === 'employees' ? 'employees WHERE salary > 120000' : activeDatasetId === 'products' ? 'products WHERE unit_price > 100' : 'customers WHERE country = "USA"'};`,
    },
    {
      label: 'Aggregate GROUP BY & COUNT',
      sql: activeDatasetId === 'students'
        ? `SELECT dept_id, COUNT(*) AS student_count, ROUND(AVG(gpa), 2) AS avg_gpa\nFROM students\nGROUP BY dept_id;`
        : activeDatasetId === 'employees'
        ? `SELECT dept_id, COUNT(*) AS head_count, ROUND(AVG(salary), 2) AS avg_salary\nFROM employees\nGROUP BY dept_id;`
        : activeDatasetId === 'products'
        ? `SELECT category_id, COUNT(*) AS item_count, ROUND(AVG(unit_price), 2) AS avg_price\nFROM products\nGROUP BY category_id;`
        : `SELECT country, COUNT(*) AS total_customers\nFROM customers\nGROUP BY country\nHAVING total_customers > 1;`,
    },
    {
      label: 'INNER JOIN with Parent Table',
      sql: activeDatasetId === 'students'
        ? `SELECT c.course_code, c.title, d.name AS dept_name\nFROM courses c\nJOIN departments d ON c.dept_id = d.dept_id;`
        : activeDatasetId === 'employees'
        ? `SELECT e.first_name, e.last_name, e.job_title, d.dept_name\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id;`
        : activeDatasetId === 'products'
        ? `SELECT p.product_name, c.name AS category_name, s.company_name AS supplier\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nJOIN suppliers s ON p.supplier_id = s.supplier_id;`
        : `SELECT c.first_name, c.last_name, o.order_id, o.total_amount\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id;`,
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(editorSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (editorSql.trim() === '' || window.confirm('Clear all code in the SQL editor?')) {
      setEditorSql('');
    }
  };

  const handleFormatSql = () => {
    // Clean and normalize basic SQL indentation
    const formatted = editorSql
      .replace(/\s+/g, ' ')
      .replace(/\s*(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|JOIN|LEFT JOIN|INNER JOIN|UNION|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM)\s+/gi, '\n$1 ')
      .trim();
    setEditorSql(formatted);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;
    saveQuery(saveTitle.trim(), editorSql, activeDatasetId, saveNotes.trim());
    setSaveModalOpen(false);
    setSaveTitle('');
    setSaveNotes('');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {/* Editor Toolbar */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/90 text-xs">
        <div className="flex items-center gap-2">
          {/* Run Query Button */}
          <button
            onClick={onExecute}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all disabled:opacity-50 active:scale-[0.98]"
            title="Execute query (Ctrl+Enter or Cmd+Enter)"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-pulse' : ''}`} />
            <span>{isExecuting ? 'Running...' : 'Run Query'}</span>
            <span className="hidden sm:inline text-[10px] opacity-75 ml-1 font-mono">⌘Enter</span>
          </button>

          {/* Quick Sample Queries dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                setEditorSql(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" disabled>
              Insert Sample Query...
            </option>
            {sampleTemplates.map((t, idx) => (
              <option key={idx} value={t.sql}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1">
          {/* Format Code */}
          <button
            onClick={handleFormatSql}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Format SQL query"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Save / Bookmark Query */}
          <button
            onClick={() => {
              setSaveTitle(`Query on ${datasets.find(d => d.id === activeDatasetId)?.name || 'Database'}`);
              setSaveModalOpen(true);
            }}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Save to favorites"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
          </button>

          {/* Copy SQL */}
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Copy query text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Editor */}
          <button
            onClick={handleClear}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CodeMirror SQL Editor Canvas */}
      <div className="flex-1 overflow-auto text-sm">
        <CodeMirror
          value={editorSql}
          height="100%"
          theme={theme === 'dark' ? oneDark : 'light'}
          extensions={[sql()]}
          onChange={(value) => setEditorSql(value)}
          basicSetup={{
            lineNumbers: userSettings.lineNumbers,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightActiveLine: true,
          }}
          style={{
            fontSize: `${userSettings.fontSize || 14}px`,
            fontFamily: 'var(--font-mono)',
            height: '100%',
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              onExecute();
            }
          }}
        />
      </div>

      {/* Save Query Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Save Query to Favorites
            </h3>
            <form onSubmit={handleSaveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Query Name / Label
                </label>
                <input
                  type="text"
                  required
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="e.g. Top Customers Lifetime Spending"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="What does this query do or demonstrate?"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                >
                  Save Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
