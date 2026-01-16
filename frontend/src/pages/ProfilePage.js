import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import NotificationSettings from '../components/NotificationSettings';
import RegisterPlayerIdButton from '../components/RegisterPlayerIdButton';
import '../styles/ProfilePage.css';

const roleLabels = {
  user: 'Utilisateur',
  utilisateur: 'Utilisateur',
  referent: 'Référent',
  responsable: 'Responsable',
  admin: 'Administrateur',
};

const ProfilePage = () => {
  const { user, isAuthenticated, updateProfile, refreshUser } = useContext(AuthContext);
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    churchWebsite: '',
    phoneNumber: '',
    ministryRole: '',
    bio: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      youtube: '',
    },
  });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [saving, setSaving] = useState(false);
  const [resendStatus, setResendStatus] = useState({ type: null, message: '' });
  const [resendLoading, setResendLoading] = useState(false);

  const displayRole = user?.role === 'user' ? 'utilisateur' : user?.role || 'utilisateur';

  useEffect(() => {
    if (location.state?.message) {
      setStatus({ type: 'error', message: location.state.message });
    }
  }, [location.state]);

  useEffect(() => {
    if (user?.isEmailVerified) {
      setResendStatus({ type: null, message: '' });
    }
  }, [user?.isEmailVerified]);

  const formattedSocialLinks = useMemo(() => {
    if (!user?.socialLinks) return {};
    if (typeof user.socialLinks === 'object' && !Array.isArray(user.socialLinks)) {
      return user.socialLinks;
    }
    return {};
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      churchWebsite: user.churchWebsite || '',
      phoneNumber: user.phoneNumber || '',
      ministryRole: user.ministryRole || '',
      bio: user.bio || '',
      socialLinks: {
        facebook: formattedSocialLinks.facebook || '',
        instagram: formattedSocialLinks.instagram || '',
        youtube: formattedSocialLinks.youtube || '',
      },
    });
  }, [user, formattedSocialLinks]);

  if (!isAuthenticated) {
    return (
      <div className="profile-page-container">
        <div className="profile-card">
          <h1>Mon Profil</h1>
          <p>Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: null, message: '' });
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        churchWebsite: formData.churchWebsite,
        phoneNumber: formData.phoneNumber,
        ministryRole: formData.ministryRole,
        bio: formData.bio,
        socialLinks: formData.socialLinks,
      };

      const result = await updateProfile(payload);
      if (!result.success) {
        throw new Error(result.error || 'Impossible de mettre à jour le profil');
      }

      await refreshUser();
      setStatus({ type: 'success', message: 'Profil mis à jour avec succès' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Une erreur est survenue' });
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setResendLoading(true);
    setResendStatus({ type: null, message: '' });

    try {
      const response = await axios.post('/api/auth/resend-verification', { email: user.email });
      setResendStatus({
        type: 'success',
        message: response.data?.message || 'Email de vérification renvoyé. Vérifiez votre boîte de réception.',
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Impossible de renvoyer l\'email de vérification.';
      setResendStatus({ type: 'error', message });
    } finally {
      setResendLoading(false);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return 'Non renseigné';
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <div className="profile-header">
          <div>
            <h1>Mon Profil</h1>
            <p>Gérez vos informations personnelles et vos coordonnées.</p>
          </div>
          <span className={`role-badge role-${displayRole}`}>
            {roleLabels[user?.role] || roleLabels.utilisateur}
          </span>
        </div>

          {!user?.isEmailVerified && (
            <div className="verification-alert">
              <div>
                <h2>Vérifiez votre email</h2>
                <p>
                  Pour accéder à toutes les fonctionnalités, confirmez votre adresse. Consultez votre boîte de
                  réception ou renvoyez le lien de vérification.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading ? 'Envoi en cours...' : 'Renvoyer l\'email de vérification'}
              </button>
            </div>
          )}

          {/* Bouton activation notifications push */}
          <RegisterPlayerIdButton />

          <div className="profile-meta">
          <div className="meta-item">
            <span className="meta-label">Dernière connexion</span>
            <span className="meta-value">{formatDateTime(user.lastLoginAt)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Email vérifié</span>
            <span className="meta-value">{user.isEmailVerified ? 'Oui' : 'Non'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Vérifié le</span>
            <span className="meta-value">{formatDateTime(user.emailVerifiedAt)}</span>
          </div>
        </div>

          {status.type && (
            <div className={`profile-alert profile-alert-${status.type}`}>
              {status.message}
            </div>
          )}
          {resendStatus.type && (
            <div className={`profile-alert profile-alert-${resendStatus.type}`}>
              {resendStatus.message}
            </div>
          )}

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span>Prénom</span>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </label>
            <label className="form-field">
              <span>Nom</span>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input type="email" value={user.email} disabled />
            </label>
            <label className="form-field">
              <span>Site ou église</span>
              <input
                type="text"
                name="churchWebsite"
                value={formData.churchWebsite}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </label>
            <label className="form-field">
              <span>Téléphone</span>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="06 12 34 56 78"
              />
            </label>
            <label className="form-field">
              <span>Rôle ministériel</span>
              <input
                type="text"
                name="ministryRole"
                value={formData.ministryRole}
                onChange={handleInputChange}
                placeholder="Animateur louange, Responsable groupe..."
              />
            </label>
          </div>

          <label className="form-field">
            <span>Biographie</span>
            <textarea
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Présentez-vous en quelques phrases"
            />
          </label>

          <div className="social-section">
            <h2>Liens sociaux</h2>
            <div className="form-grid">
              <label className="form-field">
                <span>Facebook</span>
                <input
                  type="url"
                  name="facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleSocialChange}
                  placeholder="https://facebook.com/..."
                />
              </label>
              <label className="form-field">
                <span>Instagram</span>
                <input
                  type="url"
                  name="instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleSocialChange}
                  placeholder="https://instagram.com/..."
                />
              </label>
              <label className="form-field">
                <span>YouTube</span>
                <input
                  type="url"
                  name="youtube"
                  value={formData.socialLinks.youtube}
                  onChange={handleSocialChange}
                  placeholder="https://youtube.com/..."
                />
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>

        {/* Section Notifications Push */}
        <div className="notifications-section">
          <NotificationSettings user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
