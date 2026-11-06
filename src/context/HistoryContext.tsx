import React, { createContext, useContext, useEffect, useState } from 'react';
import { HistoryItem, SavedQuery, UserSettings } from '../types/index.ts';

interface HistoryContextType {
  history: HistoryItem[];
  savedQueries: SavedQuery[];
  completedChallenges: string[];
  userSettings: UserSettings;
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  saveQuery: (title: string, sql: string, datasetId: string, notes?: string) => void;
  deleteSavedQuery: (id: string) => void;
  markChallengeComplete: (challengeId: string) => void;
  isChallengeComplete: (challengeId: string) => boolean;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSessionId: () => void;
}

const defaultSettings: UserSettings = {
  fontSize: 14,
  lineNumbers: true,
  autoFormatOnRun: false,
  defaultDataset: 'students',
  sessionId: 'session_' + Math.random().toString(36).substring(2, 10),
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('sql_playground_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(() => {
    try {
      const stored = localStorage.getItem('sql_playground_saved_queries');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sql_playground_completed_challenges');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem('sql_playground_settings');
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sql_playground_history', JSON.stringify(history.slice(0, 100)));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('sql_playground_saved_queries', JSON.stringify(savedQueries));
    } catch (e) {
      console.warn('Failed to save queries to localStorage', e);
    }
  }, [savedQueries]);

  useEffect(() => {
    try {
      localStorage.setItem('sql_playground_completed_challenges', JSON.stringify(completedChallenges));
    } catch (e) {
      console.warn('Failed to save challenges to localStorage', e);
    }
  }, [completedChallenges]);

  useEffect(() => {
    try {
      localStorage.setItem('sql_playground_settings', JSON.stringify(userSettings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [userSettings]);

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev.slice(0, 99)]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const saveQuery = (title: string, sql: string, datasetId: string, notes?: string) => {
    const newSaved: SavedQuery = {
      id: 'saved_' + Date.now(),
      title,
      sql,
      datasetId,
      notes,
      createdAt: Date.now(),
    };
    setSavedQueries(prev => [newSaved, ...prev]);
  };

  const deleteSavedQuery = (id: string) => {
    setSavedQueries(prev => prev.filter(q => q.id !== id));
  };

  const markChallengeComplete = (challengeId: string) => {
    setCompletedChallenges(prev => {
      if (prev.includes(challengeId)) return prev;
      return [...prev, challengeId];
    });
  };

  const isChallengeComplete = (challengeId: string) => {
    return completedChallenges.includes(challengeId);
  };

  const updateSettings = (partial: Partial<UserSettings>) => {
    setUserSettings(prev => ({ ...prev, ...partial }));
  };

  const resetSessionId = () => {
    const newId = 'session_' + Math.random().toString(36).substring(2, 10);
    setUserSettings(prev => ({ ...prev, sessionId: newId }));
  };

  return (
    <HistoryContext.Provider
      value={{
        history,
        savedQueries,
        completedChallenges,
        userSettings,
        addHistoryItem,
        deleteHistoryItem,
        clearHistory,
        saveQuery,
        deleteSavedQuery,
        markChallengeComplete,
        isChallengeComplete,
        updateSettings,
        resetSessionId,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
