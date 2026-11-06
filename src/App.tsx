import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { HistoryProvider } from './context/HistoryContext.tsx';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { EditorPage } from './pages/EditorPage.tsx';
import { ChallengesPage } from './pages/ChallengesPage.tsx';
import { ExplorerPage } from './pages/ExplorerPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

const AppContent: React.FC = () => {
  const { activePage } = useDatabase();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'editor':
        return <EditorPage />;
      case 'challenges':
        return <ChallengesPage />;
      case 'explorer':
        return <ExplorerPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <EditorPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Only hide sidebar on landing page if desired, or show on all for easy access */}
        {activePage !== 'landing' && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}
        <main className="flex-1 min-w-0 overflow-hidden relative">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <HistoryProvider>
        <DatabaseProvider>
          <AppContent />
        </DatabaseProvider>
      </HistoryProvider>
    </ThemeProvider>
  );
}
