import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AlertPanel from './components/AlertPanel';
import TaskManager from './components/TaskManager';
import PatientList from './components/PatientList';
import ConvertToTaskModal from './components/ConvertToTaskModal';
import { AIAlert } from './types';

type ViewType = 'dashboard' | 'alerts' | 'tasks' | 'patients';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [convertingAlert, setConvertingAlert] = useState<AIAlert | null>(null);

  const handleConvertToTask = (alert: AIAlert) => {
    setConvertingAlert(alert);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'alerts':
        return (
          <div className="h-full overflow-y-auto p-6">
            <AlertPanel onConvertToTask={handleConvertToTask} />
          </div>
        );
      case 'tasks':
        return (
          <div className="h-full overflow-y-auto p-6">
            <TaskManager />
          </div>
        );
      case 'patients':
        return (
          <div className="h-full overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PatientList />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <AlertPanel onConvertToTask={handleConvertToTask} />
                <TaskManager />
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>

      {/* Convert to Task Modal */}
      {convertingAlert && (
        <ConvertToTaskModal
          alert={convertingAlert}
          onClose={() => setConvertingAlert(null)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
