import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardScreen } from './screens/DashboardScreen';
import { MerchantsScreen } from './screens/MerchantsScreen';
import { ReceiptsScreen } from './screens/ReceiptsScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { SystemScreen } from './screens/SystemScreen';
import { AuthScreen } from './screens/AuthScreen';
import { getToken, getStoredUser, clearAuth } from './lib/apiClient';
import type { ScreenTab } from './types/models';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ScreenTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      setCurrentUser(getStoredUser());
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentUser(getStoredUser());
  };

  const handleLogout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-bolt-surface flex">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userEmail={currentUser?.email || 'admin@billbolt.com'}
        userRole={currentUser?.role || 'ADMIN'}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardScreen onNavigateToMerchants={() => setActiveTab('merchants')} />
          )}

          {activeTab === 'merchants' && (
            <MerchantsScreen searchQuery={searchQuery} />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsScreen searchQuery={searchQuery} />
          )}

          {activeTab === 'inventory' && (
            <InventoryScreen searchQuery={searchQuery} />
          )}

          {activeTab === 'system' && (
            <SystemScreen />
          )}
        </main>
      </div>
    </div>
  );
}
