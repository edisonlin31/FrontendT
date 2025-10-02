import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { checkAuthStatus, logoutUser } from './store/slices/authSlice';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TicketListPage } from './pages/TicketListPage';
import { TicketDetailPage } from './pages/TicketDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});


function AppContent() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is already logged in
    dispatch(checkAuthStatus());
  }, [dispatch]);


  useEffect(() => {
      queryClient.clear();
  }, [currentUser, queryClient]);

  const handleLogout = async () => {
    dispatch(logoutUser());
  };

  // Helper function to create protected routes with layout
  const protectedRoute = (component: React.ReactNode) => {
    if (!isAuthenticated || !currentUser) {
      return <Navigate to="/login" replace />;
    }
    return (
      <Layout currentUser={currentUser} onLogout={handleLogout}>
        {component}
      </Layout>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated || !currentUser ? (
                <LoginPage />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          {/* Protected Routes */}
          <Route
            path="/"
            element={protectedRoute(<DashboardPage />)}
          />
          <Route
            path="/tickets"
            element={protectedRoute(<TicketListPage currentUser={currentUser!} />)}
          />
          <Route
            path="/tickets/:id"
            element={protectedRoute(<TicketDetailPage currentUser={currentUser!} />)}
          />
          <Route 
            path="*" 
            element={protectedRoute(<Navigate to="/" replace />)}
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
