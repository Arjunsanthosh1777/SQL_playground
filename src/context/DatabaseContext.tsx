import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { DatasetMeta, TableSchema, ExecutionResponse } from '../types/index.ts';
import { useHistory } from './HistoryContext.tsx';
import { clientSqlEngine } from '../services/sqlEngine.ts';
import { DATASETS } from '../data/seedData.ts';

interface DatabaseContextType {
  datasets: DatasetMeta[];
  activeDatasetId: string;
  activeDataset: DatasetMeta | undefined;
  schema: TableSchema[];
  activeTable: TableSchema | null;
  isLoadingSchema: boolean;
  isResetting: boolean;
  statusMessage: string | null;
  editorSql: string;
  activePage: string;
  setActivePage: (page: string) => void;
  setEditorSql: (sql: string) => void;
  setActiveTable: (table: TableSchema | null) => void;
  switchDataset: (datasetId: string) => Promise<void>;
  resetCurrentDataset: () => Promise<void>;
  refreshSchema: () => Promise<void>;
  executeQuery: (sql: string) => Promise<ExecutionResponse>;
  insertSampleQuery: (sql: string) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userSettings, addHistoryItem } = useHistory();
  const [datasets, setDatasets] = useState<DatasetMeta[]>(() => Object.values(DATASETS));
  const [activeDatasetId, setActiveDatasetId] = useState<string>(userSettings.defaultDataset || 'students');
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [activeTable, setActiveTable] = useState<TableSchema | null>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<string>('editor');

  // Track if backend is available (true) or if running in static/Vercel client mode (false)
  const isBackendAvailable = useRef<boolean | null>(null);

  const [editorSql, setEditorSql] = useState<string>(
    `-- Welcome to SQL Playground!
-- Select all students with GPA >= 3.80:
SELECT first_name, last_name, gpa, enrollment_year
FROM students
WHERE gpa >= 3.80
ORDER BY gpa DESC;`
  );

  // Initialize client-side SQLite engine as guaranteed fallback
  useEffect(() => {
    clientSqlEngine.init().catch(err => {
      console.warn('Failed to initialize client SQL engine:', err);
    });
  }, []);

  // Fetch datasets list on mount
  useEffect(() => {
    fetch('/api/datasets')
      .then(async res => {
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.datasets) {
            isBackendAvailable.current = true;
            setDatasets(data.datasets);
            return;
          }
        }
        // Vercel or static hosting mode (no backend running)
        isBackendAvailable.current = false;
        setDatasets(clientSqlEngine.getDatasets());
      })
      .catch(() => {
        isBackendAvailable.current = false;
        setDatasets(clientSqlEngine.getDatasets());
      });
  }, []);

  // Fetch schema for active dataset
  const fetchSchema = useCallback(async (datasetId: string) => {
    setIsLoadingSchema(true);

    // If already known that backend is not available, run client-side immediately
    if (isBackendAvailable.current === false) {
      await clientSqlEngine.init();
      const clientTables = clientSqlEngine.getSchema(datasetId);
      setSchema(clientTables);
      setActiveTable(prev => {
        if (prev) {
          const found = clientTables.find(t => t.name === prev.name);
          return found || clientTables[0] || null;
        }
        return clientTables[0] || null;
      });
      setIsLoadingSchema(false);
      return;
    }

    try {
      const res = await fetch(`/api/datasets/${datasetId}/schema`, {
        headers: {
          'x-session-id': userSettings.sessionId,
        },
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.tables) {
          isBackendAvailable.current = true;
          setSchema(data.tables);
          setActiveTable(prev => {
            if (prev) {
              const found = data.tables.find((t: TableSchema) => t.name === prev.name);
              return found || data.tables[0] || null;
            }
            return data.tables[0] || null;
          });
          return;
        }
      }

      // Fallback to client engine
      throw new Error('Backend unavailable');
    } catch {
      isBackendAvailable.current = false;
      await clientSqlEngine.init();
      const clientTables = clientSqlEngine.getSchema(datasetId);
      setSchema(clientTables);
      setActiveTable(prev => {
        if (prev) {
          const found = clientTables.find(t => t.name === prev.name);
          return found || clientTables[0] || null;
        }
        return clientTables[0] || null;
      });
    } finally {
      setIsLoadingSchema(false);
    }
  }, [userSettings.sessionId]);

  useEffect(() => {
    fetchSchema(activeDatasetId);
  }, [activeDatasetId, fetchSchema]);

  const switchDataset = async (datasetId: string) => {
    if (datasetId === activeDatasetId) return;
    setActiveDatasetId(datasetId);

    if (datasetId === 'students') {
      setEditorSql(`SELECT * FROM departments;\nSELECT * FROM courses LIMIT 5;`);
    } else if (datasetId === 'employees') {
      setEditorSql(`SELECT emp_id, first_name, last_name, job_title, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 10;`);
    } else if (datasetId === 'products') {
      setEditorSql(`SELECT p.product_name, c.name AS category, p.unit_price, p.units_in_stock\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nLIMIT 10;`);
    } else if (datasetId === 'customers_orders') {
      setEditorSql(`SELECT c.first_name, c.last_name, o.order_id, o.order_date, o.total_amount\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nLIMIT 10;`);
    }
  };

  const resetCurrentDataset = async () => {
    setIsResetting(true);
    try {
      // Always reset client engine in case it's in use
      await clientSqlEngine.init();
      clientSqlEngine.resetDataset(activeDatasetId);

      if (isBackendAvailable.current !== false) {
        try {
          const res = await fetch('/api/reset', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-session-id': userSettings.sessionId,
            },
            body: JSON.stringify({ datasetId: activeDatasetId }),
          });
          const data = await res.json();
          if (data.success && data.tables) {
            setSchema(data.tables);
            if (data.tables.length > 0) setActiveTable(data.tables[0]);
          }
        } catch {
          isBackendAvailable.current = false;
        }
      }

      const clientTables = clientSqlEngine.getSchema(activeDatasetId);
      setSchema(clientTables);
      if (clientTables.length > 0) setActiveTable(clientTables[0]);

      setStatusMessage(`Dataset '${DATASETS[activeDatasetId]?.name || activeDatasetId}' successfully reset.`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to reset dataset:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const refreshSchema = async () => {
    await fetchSchema(activeDatasetId);
  };

  const executeQuery = async (sql: string): Promise<ExecutionResponse> => {
    // If backend is known to be unavailable, execute client-side immediately
    if (isBackendAvailable.current === false) {
      await clientSqlEngine.init();
      const res = clientSqlEngine.executeSql(activeDatasetId, sql);

      const totalRows = res.results.reduce((acc, r) => acc + (r.rowCount || r.rowsAffected || 0), 0);
      addHistoryItem({
        sql,
        datasetId: activeDatasetId,
        executionTimeMs: res.executionTimeMs || 0,
        rowCount: totalRows,
        success: res.success,
        error: res.error,
      });

      const upper = sql.trim().toUpperCase();
      if (
        upper.startsWith('INSERT') ||
        upper.startsWith('UPDATE') ||
        upper.startsWith('DELETE') ||
        upper.startsWith('CREATE') ||
        upper.startsWith('DROP') ||
        upper.startsWith('ALTER')
      ) {
        refreshSchema();
      }

      return res;
    }

    // Try backend first
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': userSettings.sessionId,
        },
        body: JSON.stringify({
          sql,
          datasetId: activeDatasetId,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        isBackendAvailable.current = true;
        const data: ExecutionResponse = await res.json();

        const totalRows = data.results.reduce((acc, r) => acc + (r.rowCount || r.rowsAffected || 0), 0);
        addHistoryItem({
          sql,
          datasetId: activeDatasetId,
          executionTimeMs: data.executionTimeMs || 0,
          rowCount: totalRows,
          success: data.success,
          error: data.error,
        });

        const upper = sql.trim().toUpperCase();
        if (
          upper.startsWith('INSERT') ||
          upper.startsWith('UPDATE') ||
          upper.startsWith('DELETE') ||
          upper.startsWith('CREATE') ||
          upper.startsWith('DROP') ||
          upper.startsWith('ALTER')
        ) {
          refreshSchema();
        }

        return data;
      }

      throw new Error('Backend API unreachable or returned non-JSON');
    } catch {
      // Fallback seamlessly to in-browser WebAssembly SQLite engine!
      isBackendAvailable.current = false;
      await clientSqlEngine.init();
      const res = clientSqlEngine.executeSql(activeDatasetId, sql);

      const totalRows = res.results.reduce((acc, r) => acc + (r.rowCount || r.rowsAffected || 0), 0);
      addHistoryItem({
        sql,
        datasetId: activeDatasetId,
        executionTimeMs: res.executionTimeMs || 0,
        rowCount: totalRows,
        success: res.success,
        error: res.error,
      });

      const upper = sql.trim().toUpperCase();
      if (
        upper.startsWith('INSERT') ||
        upper.startsWith('UPDATE') ||
        upper.startsWith('DELETE') ||
        upper.startsWith('CREATE') ||
        upper.startsWith('DROP') ||
        upper.startsWith('ALTER')
      ) {
        refreshSchema();
      }

      return res;
    }
  };

  const insertSampleQuery = (sql: string) => {
    setEditorSql(sql);
    setActivePage('editor');
  };

  const activeDataset = datasets.find(d => d.id === activeDatasetId);

  return (
    <DatabaseContext.Provider
      value={{
        datasets,
        activeDatasetId,
        activeDataset,
        schema,
        activeTable,
        isLoadingSchema,
        isResetting,
        statusMessage,
        editorSql,
        activePage,
        setActivePage,
        setEditorSql,
        setActiveTable,
        switchDataset,
        resetCurrentDataset,
        refreshSchema,
        executeQuery,
        insertSampleQuery,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
