import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import DynamicBackground from './components/DynamicBackground';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResendVerificationPage from './pages/ResendVerificationPage';
import CampRegistrationPage from './pages/CampRegistrationPage';
import CampRegistrationNewPage from './pages/CampRegistrationNewPage';
import GuestRegistrationPage from './pages/GuestRegistrationPage';
import LogoShowcasePage from './pages/LogoShowcasePage';
import RegistrationDashboard from './pages/RegistrationDashboard';
import UserDashboard from './pages/UserDashboard';
import ActivitiesManagement from './pages/ActivitiesManagement';
import CarouselManagement from './pages/CarouselManagement';
import ProgrammePage from './pages/ProgrammePage';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivityTrackingPage from './pages/ActivityTrackingPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import GJCRPTPage from './pages/GJCRPTPage';
import NewsletterPageNew from './pages/NewsletterPageNew';
import UserManagementPage from './pages/UserManagementPage';
import PayoutManagementPage from './pages/PayoutManagementPage';
import CashPaymentsManagement from './pages/CashPaymentsManagement';
import MessagesPage from './pages/MessagesPage';
import MessageManagementPage from './pages/MessageManagementPage';
import SettingsPage from './pages/SettingsPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import DataManagementPage from './pages/DataManagementPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PasswordResetManagementPage from './pages/PasswordResetManagementPage';
import GuardedRoute from './components/GuardedRoute';
import CookieConsent from './components/CookieConsent';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import FixedLogo from './components/FixedLogo';
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DynamicBackground page="global" />
        <FixedLogo />
        <div className="container">
          <Header />
          <PWAInstallPrompt />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/resend-verification" element={<ResendVerificationPage />} />
            <Route path="/inscription-camp" element={<CampRegistrationPage />} />
            <Route path="/inscription" element={<CampRegistrationNewPage />} />
            <Route
              path="/inscription-invite"
              element={<GuardedRoute element={<GuestRegistrationPage />} />}
            />
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
              path="/gestion-carrousel"
              element={
                <GuardedRoute
                  element={<CarouselManagement />}
                  roles={['admin']}
                />
              }
            />
            <Route
              path="/suivi-activites"
              element={
                <GuardedRoute
                  element={<ActivityTrackingPage />}
                  roles={['responsable', 'admin']}
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
            <Route
              path="/gestion/redistributions"
              element={
                <GuardedRoute
                  element={<PayoutManagementPage />}
                  roles={['responsable', 'admin']}
                />
              }
            />
            <Route
              path="/gestion/paiements-especes"
              element={
                <GuardedRoute
                  element={<CashPaymentsManagement />}
                  roles={['responsable', 'admin']}
                />
              }
            />
            <Route
              path="/messages"
              element={
                <GuardedRoute
                  element={<MessagesPage />}
                />
              }
            />
            <Route
              path="/gestion/messages"
              element={
                <GuardedRoute
                  element={<MessageManagementPage />}
                  roles={['responsable', 'admin']}
                />
              }
            />
            <Route
              path="/parametres"
              element={
                <GuardedRoute
                  element={<SettingsPage />}
                  roles={['admin']}
                />
              }
            />
            <Route
              path="/gestion/reinitialisations"
              element={
                <GuardedRoute
                  element={<PasswordResetManagementPage />}
                  roles={['responsable', 'admin']}
                />
              }
            />
            <Route path="/programme" element={<ProgrammePage />} />
            <Route path="/activites" element={<ActivitiesPage />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/gj-crpt" element={<GJCRPTPage />} />
            <Route path="/newsletter" element={<NewsletterPageNew />} />
            <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
            <Route path="/conditions-utilisation" element={<TermsOfServicePage />} />
            <Route path="/gestion-donnees" element={<DataManagementPage />} />
            <Route path="/acces-refuse" element={<AccessDeniedPage />} />
          </Routes>
          <Footer />
          <CookieConsent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
