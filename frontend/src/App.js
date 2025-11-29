import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResendVerificationPage from './pages/ResendVerificationPage';
import CampRegistrationPage from './pages/CampRegistrationPage';
import CampRegistrationNewPage from './pages/CampRegistrationNewPage';
import LogoShowcasePage from './pages/LogoShowcasePage';
import RegistrationDashboard from './pages/RegistrationDashboard';
import UserDashboard from './pages/UserDashboard';
import ActivitiesManagement from './pages/ActivitiesManagement';
import ProgrammePage from './pages/ProgrammePage';
import ActivitiesPage from './pages/ActivitiesPage';
import ProfilePage from './pages/ProfilePage';
import NewsletterPage from './pages/NewsletterPage';
import UserManagementPage from './pages/UserManagementPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import GuardedRoute from './components/GuardedRoute';
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="container">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/resend-verification" element={<ResendVerificationPage />} />
            <Route path="/inscription-camp" element={<CampRegistrationPage />} />
            <Route path="/inscription" element={<CampRegistrationNewPage />} />
            <Route path="/logos" element={<LogoShowcasePage />} />
            <Route
              path="/tableau-de-bord"
              element={<GuardedRoute element={<UserDashboard />} />}
            />
            <Route
              path="/profil"
              element={<GuardedRoute element={<ProfilePage />} />}
            />
            <Route
              path="/suivi-inscriptions"
              element={
                <GuardedRoute
                  element={<RegistrationDashboard />}
                  roles={['referent', 'responsable', 'admin']}
                />
              }
            />
            <Route
              path="/gestion-activites"
              element={
                <GuardedRoute
                  element={<ActivitiesManagement />}
                  roles={['referent', 'responsable', 'admin']}
                />
              }
            />
            <Route
              path="/gestion/utilisateurs"
              element={
                <GuardedRoute
                  element={<UserManagementPage />}
                  roles={['responsable', 'admin']}
                />
              }
            />
            <Route path="/programme" element={<ProgrammePage />} />
            <Route path="/activites" element={<ActivitiesPage />} />
            <Route path="/newsletter" element={<NewsletterPage />} />
            <Route path="/acces-refuse" element={<AccessDeniedPage />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
