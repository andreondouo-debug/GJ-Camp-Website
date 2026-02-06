import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import axios from 'axios';
import { getApiUrl } from './config/api';
import Header from './components/Header';
import Footer from './components/Footer';
import DynamicBackground from './components/DynamicBackground';
// import { initOneSignal } from './services/oneSignalService'; // ❌ Désactivé - On utilise Web Push natif
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
import GJPage from './pages/GJPage';
import NewsletterPageNew from './pages/NewsletterPageNew';
import UserManagementPage from './pages/UserManagementPage';
import CreateRegistrationPage from './pages/CreateRegistrationPage';
import PayoutManagementPage from './pages/PayoutManagementPage';
import CashPaymentsManagement from './pages/CashPaymentsManagement';
import CampusManagement from './pages/CampusManagement';
import MessagesPage from './pages/MessagesPage';
import MessageManagementPage from './pages/MessageManagementPage';
import SettingsPage from './pages/SettingsPage';
import CRPTSettingsPage from './pages/CRPTSettingsPage';
import GJSettingsPage from './pages/GJSettingsPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import DataManagementPage from './pages/DataManagementPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PasswordResetManagementPage from './pages/PasswordResetManagementPage';
import CampusLeadersManagement from './pages/CampusLeadersManagement';
import GuardedRoute from './components/GuardedRoute';
import RequireRegistration from './components/RequireRegistration';
// import CookieConsent from './components/CookieConsent'; // Désactivé - acceptation implicite via politique
import PWAInstallPrompt from './components/PWAInstallPrompt';
import VersionBadge from './components/VersionBadge';
import './styles/App.css';

function App() {
  // ❌ OneSignal désactivé - On utilise Web Push natif avec VAPID
  // useEffect(() => {
  //   const initNotifications = async () => {
  //     try {
  //       await initOneSignal();
  //       console.log('🔔 OneSignal prêt');
  //     } catch (error) {
  //       console.error('❌ Erreur init OneSignal:', error);
  //     }
  //   };
  //   initNotifications();
  // }, []);

  // Charger et appliquer la couleur de la barre de statut mobile globalement
  useEffect(() => {
    const loadStatusBarColor = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/settings/status-bar-color'));
        const color = response.data.statusBarColor || '#a01e1e';
        
        let themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (!themeColorMeta) {
          themeColorMeta = document.createElement('meta');
          themeColorMeta.name = 'theme-color';
          document.head.appendChild(themeColorMeta);
        }
        themeColorMeta.content = color;
        console.log('🎨 Couleur barre statut appliquée:', color);
      } catch (error) {
        console.log('📱 Couleur barre statut par défaut');
      }
    };

    loadStatusBarColor();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <DynamicBackground page="global" />
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
            <Route path="/inscription-camp" element={<CampRegistrationNewPage />} />
            <Route path="/inscription" element={<CampRegistrationPage />} />
            <Route
              path="/inscription-invite"
              element={<GuardedRoute element={<GuestRegistrationPage />} />}
            />
            <Route path="/logos" element={<LogoShowcasePage />} />
            <Route
              path="/tableau-de-bord"
              element={
                <GuardedRoute 
                  element={
                    <RequireRegistration>
                      <UserDashboard />
                    </RequireRegistration>
                  } 
                />
              }
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
              path="/inscription/creer"
              element={
                <GuardedRoute
                  element={<CreateRegistrationPage />}
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
                  roles={['referent', 'responsable', 'admin']}
                />
              }
            />
            <Route
              path="/gestion/campus"
              element={
                <GuardedRoute
                  element={<CampusManagement />}
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
              path="/parametres/crpt"
              element={
                <GuardedRoute
                  element={<CRPTSettingsPage />}
                  roles={['admin']}
                />
              }
            />
            <Route
              path="/parametres/gj"
              element={
                <GuardedRoute
                  element={<GJSettingsPage />}
                  roles={['responsable', 'admin']}
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
            <Route 
              path="/programme" 
              element={
                <GuardedRoute 
                  element={
                    <RequireRegistration>
                      <ProgrammePage />
                    </RequireRegistration>
                  } 
                />
              } 
            />
            <Route 
              path="/activites" 
              element={
                <GuardedRoute 
                  element={
                    <RequireRegistration>
                      <ActivitiesPage />
                    </RequireRegistration>
                  } 
                />
              } 
            />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/gj-crpt" element={<GJCRPTPage />} />
            <Route path="/generation-josue" element={<GJPage />} />
            <Route
              path="/gestion/responsables-campus"
              element={
                <GuardedRoute
                  element={<CampusLeadersManagement />}
                  roles={['responsable', 'admin']}
                />
              }
            />
            <Route path="/newsletter" element={<NewsletterPageNew />} />
            <Route path="/politique-confidentialite" element={<PrivacyPolicyPage />} />
            <Route path="/conditions-utilisation" element={<TermsOfServicePage />} />
            <Route path="/gestion-donnees" element={<DataManagementPage />} />
            <Route path="/acces-refuse" element={<AccessDeniedPage />} />
          </Routes>
          <Footer />
          {/* <CookieConsent /> - Désactivé: acceptation implicite par utilisation du site */}
          <VersionBadge />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
