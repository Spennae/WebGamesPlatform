import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './hooks/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PlayPage } from './pages/PlayPage';
import { LeaderboardsPage } from './pages/LeaderboardsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { AdminFeedbackPage } from './pages/AdminFeedbackPage';
import { NotFoundPage } from './pages/NotFoundPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/leaderboards" element={<LeaderboardsPage />} />
            <Route
              path="/play/:slug"
              element={
                <ProtectedRoute>
                  <PlayPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute>
                  <FeedbackPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <ProtectedRoute>
                  <AdminFeedbackPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;