import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { DashboardRequester } from './pages/DashboardRequester';
import { NewRequest } from './pages/NewRequest';
import { DashboardApprover } from './pages/DashboardApprover';
import { AdminPanel } from './pages/AdminPanel';
import { GlobalAnalytics } from './pages/GlobalAnalytics';
import { User, UserRole, SpaceRequest } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // State for passing data between views (e.g. Renewal pre-fill)
  const [viewData, setViewData] = useState<any>(null);

  // Determine initial view based on role
  useEffect(() => {
    if (user) {
      if (user.role === UserRole.REQUESTER) setCurrentView('requester-dashboard');
      else if (user.role === UserRole.ADMIN) setCurrentView('admin-users');
      else setCurrentView('approver-dashboard');
    }
  }, [user]);

  const handleNavigate = (view: string, data?: any) => {
      if (data) setViewData(data);
      setCurrentView(view);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'requester-dashboard':
        return <DashboardRequester currentUser={user} onNavigate={handleNavigate} />;
      case 'new-request':
        return <NewRequest 
            currentUser={user} 
            onSuccess={() => {
                setViewData(null); // Clear pre-fill data after success
                setCurrentView('requester-dashboard');
            }}
            preFillData={viewData as SpaceRequest} 
        />;
      case 'approver-dashboard':
        return <DashboardApprover currentUser={user} />;
      case 'global-analytics':
        return <GlobalAnalytics />;
      case 'admin-users':
        return <AdminPanel view="users" />;
      case 'admin-rates':
        return <AdminPanel view="rates" />;
      case 'admin-features':
        return <AdminPanel view="features" />;
      default:
        return <div className="p-8">View not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-industrial-100 font-sans text-industrial-900">
      <Sidebar 
        currentUser={user} 
        onLogout={() => {
            setUser(null);
            setViewData(null);
        }} 
        currentView={currentView}
        onChangeView={(view) => {
            setViewData(null); // Clear data on manual navigation
            setCurrentView(view);
        }}
      />
      <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;