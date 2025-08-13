import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore, useUIStore } from './store';
import frappeAPI from './lib/api';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Page Components
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ListView from './pages/ListView';
import FormView from './pages/FormView';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await frappeAPI.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      }
    };

    if (isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, setUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useUIStore();

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className={`h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${theme}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/desk" element={<Dashboard />} />
                      
                      {/* Generic DocType Routes */}
                      <Route path="/:module/:doctype" element={<ListView />} />
                      <Route path="/:module/:doctype/new" element={<FormView mode="create" />} />
                      <Route path="/:module/:doctype/:docname" element={<FormView mode="edit" />} />
                      <Route path="/:module/:doctype/:docname/view" element={<FormView mode="view" />} />
                      
                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default App;