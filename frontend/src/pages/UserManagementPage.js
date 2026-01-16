import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { getOneSignalPlayerId, setUserEmail } from '../services/oneSignalService';
import { getApiUrl } from '../config/api';
import '../styles/UserManagementPage.css';

const roleLabels = {
  user: 'Utilisateur',
  utilisateur: 'Utilisateur',
  referent: 'Référent',
  responsable: 'Responsable',
  admin: 'Administrateur',
};

const UserManagementPage = () => {
  const { user, token, isAuthenticated } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [filters, setFilters] = useState({ search: '', role: 'all' });
  const [feedback, setFeedback] = useState({ type: null, message: '' });
  const [verifyingUserId, setVerifyingUserId] = useState(null);
  const [updatingPermissionUserId, setUpdatingPermissionUserId] = useState(null);

  // États pour le test des notifications OneSignal
  const [testNotification, setTestNotification] = useState({
    testType: 'me',
    userId: '',
    title: '🧪 Test OneSignal',
    message: 'Ceci est une notification de test'
  });
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationFeedback, setNotificationFeedback] = useState({ type: null, message: '' });

  const isAdmin = user?.role === 'admin';
  const canView = useMemo(() => ['responsable', 'admin'].includes(user?.role), [user]);

  useEffect(() => {
    if (!isAuthenticated || !token || !canView) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesResponse, usersResponse] = await Promise.all([
          axios.get('/api/users/roles', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setRoles(rolesResponse.data.roles || []);
        const normalizedUsers = (usersResponse.data.users || []).map((item) => ({
          ...item,
          role: item.role === 'user' ? 'utilisateur' : item.role,
        }));
        setUsers(normalizedUsers);
      } catch (error) {
        console.error('❌ Erreur récupération utilisateurs:', error);
        setFeedback({ type: 'error', message: 'Impossible de charger la liste des utilisateurs' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, canView]);

  // Test de notification OneSignal
  const handleTestNotification = async () => {
    if (!testNotification.title || !testNotification.message) {
      setNotificationFeedback({ type: 'error', message: '⚠️ Titre et message requis' });
      return;
    }

    setSendingNotification(true);
    setNotificationFeedback({ type: null, message: '' });

    try {
      const response = await axios.post(
        getApiUrl('/api/settings/test-notification'),
        {
          testType: testNotification.testType,
          userId: testNotification.userId,
          title: testNotification.title,
          message: testNotification.message
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setNotificationFeedback({ type: 'success', message: response.data.message });
      console.log('✅ Notification envoyée:', response.data);
    } catch (error) {
      console.error('❌ Erreur test notification:', error);
      setNotificationFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Erreur lors de l\'envoi'
      });
    } finally {
      setSendingNotification(false);
    }
  };

  // Enregistrer Player ID manuellement
  const handleRegisterPlayerId = async () => {
    setSendingNotification(true);
    setNotificationFeedback({ type: null, message: '' });

    try {
      let playerId = null;
      let attempts = 0;
      const maxAttempts = 20;

      while (!playerId && attempts < maxAttempts) {
        playerId = await getOneSignalPlayerId();
        if (!playerId) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
      }

      if (!playerId) {
        setNotificationFeedback({
          type: 'error',
          message: '❌ OneSignal n\'est pas initialisé. Rechargez la page et réessayez.'
        });
        setSendingNotification(false);
        return;
      }

      console.log('📱 Player ID trouvé:', playerId);

      const response = await axios.put(
        getApiUrl('/api/auth/push-player-id'),
        { pushPlayerId: playerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (user?.email) {
        await setUserEmail(user.email);
      }

      console.log('✅ Player ID sauvegardé:', response.data);
      setNotificationFeedback({
        type: 'success',
        message: '✅ Notifications activées ! Vous recevrez maintenant les notifications push.'
      });
    } catch (error) {
      console.error('❌ Erreur enregistrement Player ID:', error);
      setNotificationFeedback({
        type: 'error',
        message: error.response?.data?.message || '❌ Erreur lors de l\'activation des notifications'
      });
    } finally {
      setSendingNotification(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const { search, role } = filters;
      const matchesRole = role === 'all' || item.role === role;
      const matchesSearch = !search
        || `${item.firstName} ${item.lastName}`.toLowerCase().includes(search.toLowerCase())
        || item.email.toLowerCase().includes(search.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, filters]);

  const handleRoleChange = async (userId, role) => {
    if (!isAdmin) {
      setFeedback({ type: 'error', message: 'Seul un administrateur peut modifier les rôles' });
      return;
    }

    setUpdatingUserId(userId);
    setFeedback({ type: null, message: '' });
    try {
      const response = await axios.patch(`/api/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = response.data.user;
      const normalized = { ...updated, role: updated.role === 'user' ? 'utilisateur' : updated.role };
      setUsers((prev) => prev.map((item) => (item._id === normalized._id ? normalized : item)));
      setFeedback({ type: 'success', message: 'Rôle mis à jour avec succès' });
    } catch (error) {
      console.error('❌ Erreur mise à jour rôle:', error);
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Mise à jour impossible' });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleManualEmailVerification = async (userId) => {
    if (!isAdmin) {
      setFeedback({ type: 'error', message: 'Seul un administrateur peut confirmer un email' });
      return;
    }

    setVerifyingUserId(userId);
    setFeedback({ type: null, message: '' });

    try {
      const response = await axios.patch(
        `/api/users/${userId}/verify-email`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = response.data.user || {};
      const normalizedUser = {
        ...updatedUser,
        role: updatedUser.role === 'user' ? 'utilisateur' : updatedUser.role,
        isEmailVerified: true,
      };

      setUsers((prev) => prev.map((item) => (
        item._id === normalizedUser._id
          ? { ...item, ...normalizedUser }
          : item
      )));

      setFeedback({ type: 'success', message: response.data.message || 'Email confirmé avec succès' });
    } catch (error) {
      console.error('❌ Erreur confirmation email:', error);
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Impossible de confirmer cet email' });
    } finally {
      setVerifyingUserId(null);
    }
  };

  const handlePermissionToggle = async (userId, currentPermission) => {
    if (!isAdmin && user?.role !== 'responsable') {
      setFeedback({ type: 'error', message: 'Seuls les responsables et administrateurs peuvent gérer les permissions' });
      return;
    }

    setUpdatingPermissionUserId(userId);
    setFeedback({ type: null, message: '' });

    try {
      const response = await axios.patch(
        `/api/users/${userId}/permissions`,
        { canCreatePost: !currentPermission },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = response.data.user || {};
      const normalizedUser = {
        ...updatedUser,
        role: updatedUser.role === 'user' ? 'utilisateur' : updatedUser.role,
      };

      setUsers((prev) => prev.map((item) => (
        item._id === normalizedUser._id
          ? { ...item, ...normalizedUser }
          : item
      )));

      setFeedback({ type: 'success', message: response.data.message || 'Permission mise à jour avec succès' });
    } catch (error) {
      console.error('❌ Erreur mise à jour permission:', error);
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Impossible de mettre à jour la permission' });
    } finally {
      setUpdatingPermissionUserId(null);
    }
  };

  const handleSuspendUser = async (userId, isCurrentlyActive) => {
    if (!isAdmin) {
      setFeedback({ type: 'error', message: 'Seul un administrateur peut suspendre un compte' });
      return;
    }

    const action = isCurrentlyActive ? 'désactiver' : 'activer';
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} ce compte utilisateur ?`)) {
      return;
    }

    setFeedback({ type: null, message: '' });

    try {
      const endpoint = isCurrentlyActive ? 'deactivate' : 'activate';
      const response = await axios.patch(
        `/api/users/${userId}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = response.data.user || {};
      const normalizedUser = {
        ...updatedUser,
        role: updatedUser.role === 'user' ? 'utilisateur' : updatedUser.role,
      };

      setUsers((prev) => prev.map((item) => (
        item._id === normalizedUser._id
          ? { ...item, ...normalizedUser }
          : item
      )));

      setFeedback({ type: 'success', message: response.data.message || `Compte ${action === 'désactiver' ? 'désactivé' : 'activé'} avec succès` });
    } catch (error) {
      console.error(`❌ Erreur ${action}:`, error);
      setFeedback({ type: 'error', message: error.response?.data?.message || `Impossible de ${action} ce compte` });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isAdmin) {
      setFeedback({ type: 'error', message: 'Seul un administrateur peut supprimer un compte' });
      return;
    }

    if (!window.confirm('⚠️ ATTENTION : Cette action est irréversible !\n\nÊtes-vous sûr de vouloir supprimer définitivement ce compte utilisateur ?')) {
      return;
    }

    setFeedback({ type: null, message: '' });

    try {
      await axios.delete(
        `/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) => prev.filter((item) => item._id !== userId));
      setFeedback({ type: 'success', message: 'Compte utilisateur supprimé avec succès' });
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Impossible de supprimer ce compte' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="user-management-container">
        <div className="management-card">
          <h1>Gestion des utilisateurs</h1>
          <p>Veuillez vous connecter pour accéder à l'administration.</p>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="user-management-container">
        <div className="management-card">
          <h1>Gestion des utilisateurs</h1>
          <p>Vous n'avez pas les droits nécessaires pour consulter cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="management-card">
        <div className="management-header">
          <div>
            <h1>Gestion des utilisateurs</h1>
            <p>Analysez les comptes et attribuez les rôles adaptés à chaque responsable.</p>
          </div>
          <div className="stats-chip">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
          </div>
        </div>

        <div className="filters-row">
          <input
            type="search"
            placeholder="Rechercher par nom ou email"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
          <select
            value={filters.role}
            onChange={(event) => setFilters((prev) => ({ ...prev, role: event.target.value }))}
          >
            <option value="all">Tous les rôles</option>
            {roles.map((roleValue) => (
              <option key={roleValue} value={roleValue}>
                {roleLabels[roleValue] || roleValue}
              </option>
            ))}
          </select>
        </div>

        {feedback.type && (
          <div className={`management-alert management-alert-${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        {/* Module Test Notifications OneSignal */}
        {isAdmin && (
          <div className="notification-test-section" style={{
            margin: '20px 0',
            padding: '25px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(160, 30, 30, 0.05) 100%)',
            borderRadius: '12px',
            border: '2px solid var(--color-secondary, #d4af37)'
          }}>
            <h2 style={{ margin: '0 0 15px 0', color: 'var(--color-secondary, #d4af37)' }}>
              🔔 Test Notifications OneSignal
            </h2>

            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  🎯 Type de test
                </label>
                <select
                  value={testNotification.testType}
                  onChange={(e) => setTestNotification(prev => ({ 
                    ...prev, 
                    testType: e.target.value,
                    userId: e.target.value === 'user' ? prev.userId : ''
                  }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '1rem'
                  }}
                >
                  <option value="me">📱 Envoyer à moi-même</option>
                  <option value="user">👤 Envoyer à un utilisateur</option>
                  <option value="all">🌍 Envoyer à tous</option>
                </select>
              </div>

              {testNotification.testType === 'user' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    👤 Utilisateur cible
                  </label>
                  <select
                    value={testNotification.userId}
                    onChange={(e) => setTestNotification(prev => ({ ...prev, userId: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '2px solid #ddd',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  📝 Titre de la notification
                </label>
                <input
                  type="text"
                  value={testNotification.title}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="🧪 Test OneSignal"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  💬 Message
                </label>
                <textarea
                  value={testNotification.message}
                  onChange={(e) => setTestNotification(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Ceci est une notification de test"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {notificationFeedback.type && (
                <div style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  background: notificationFeedback.type === 'success' 
                    ? 'rgba(76, 175, 80, 0.1)' 
                    : 'rgba(244, 67, 54, 0.1)',
                  border: `2px solid ${notificationFeedback.type === 'success' ? '#4CAF50' : '#f44336'}`,
                  color: notificationFeedback.type === 'success' ? '#2e7d32' : '#c62828'
                }}>
                  {notificationFeedback.message}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={handleRegisterPlayerId}
                disabled={sendingNotification}
                style={{
                  background: 'linear-gradient(135deg, var(--color-secondary, #d4af37) 0%, var(--color-gold-dark, #b8942a) 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderRadius: '50px',
                  cursor: sendingNotification ? 'not-allowed' : 'pointer',
                  opacity: sendingNotification ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {sendingNotification ? '⏳ Activation...' : '🔔 Activer mes notifications'}
              </button>

              <button
                onClick={handleTestNotification}
                disabled={sendingNotification}
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary, #a01e1e) 0%, var(--color-primary-dark, #7a1515) 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderRadius: '50px',
                  cursor: sendingNotification ? 'not-allowed' : 'pointer',
                  opacity: sendingNotification ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {sendingNotification ? '⏳ Envoi...' : '🚀 Envoyer la notification'}
              </button>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(212, 175, 55, 0.1)',
              borderRadius: '10px',
              borderLeft: '4px solid var(--color-secondary, #d4af37)'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: 'var(--color-secondary, #d4af37)' }}>
                ℹ️ Informations importantes
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Cliquez sur "Activer mes notifications" pour enregistrer votre Player ID</li>
                <li>Les utilisateurs doivent avoir accepté les notifications</li>
                <li>Les notifications fonctionnent même si le site est fermé (navigateur ouvert)</li>
                <li>Vérifiez les Player IDs: <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '3px' }}>node backend/check-player-ids.js</code></li>
              </ul>
            </div>
          </div>
        )}

        {loading ? (
          <div className="management-loading">Chargement des utilisateurs...</div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <span>Identité</span>
              <span>Contact</span>
              <span>Rôle</span>
              <span>Statut</span>
              <span>Permissions</span>
              <span>Actions</span>
            </div>
            <div className="table-body">{filteredUsers.map((item) => (
                <div className="table-row" key={item._id}>
                  <div className="table-cell">
                    <div className="user-name">{item.firstName} {item.lastName}</div>
                    <div className="user-meta">Inscrit le {new Date(item.createdAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="table-cell">
                    <div className="user-email">{item.email}</div>
                    {item.phoneNumber && <div className="user-meta">{item.phoneNumber}</div>}
                  </div>
                  <div className="table-cell">
                    <span className={`role-chip role-chip-${item.role}`}>
                      {roleLabels[item.role] || item.role}
                    </span>
                  </div>
                  <div className="table-cell">
                    <div className="badge-list">
                      <span className={`badge ${item.isEmailVerified ? 'badge-success' : 'badge-warning'}`}>
                        {item.isEmailVerified ? 'Email vérifié' : 'Email en attente'}
                      </span>
                      <span className={`badge ${item.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                        {item.isActive !== false ? 'Compte actif' : 'Compte suspendu'}
                      </span>
                      <span className="badge badge-ghost">
                        Dernière connexion {item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleDateString('fr-FR') : 'n/a'}
                      </span>
                    </div>
                  </div>
                  <div className="table-cell">
                    {(isAdmin || user?.role === 'responsable') && !['admin', 'responsable'].includes(item.role) ? (
                      <label className="permission-toggle">
                        <input
                          type="checkbox"
                          checked={item.canCreatePost !== false}
                          onChange={() => handlePermissionToggle(item._id, item.canCreatePost !== false)}
                          disabled={updatingPermissionUserId === item._id}
                        />
                        <span className="permission-label">
                          {item.canCreatePost !== false ? 'Peut créer des posts' : 'Création désactivée'}
                        </span>
                      </label>
                    ) : (
                      <span className="badge badge-info">
                        {['admin', 'responsable'].includes(item.role) ? 'Tous droits' : 'N/A'}
                      </span>
                    )}
                  </div>
                  <div className="table-cell">{isAdmin ? (
                      <div className="actions-stack">
                        <select
                          value={item.role}
                          onChange={(event) => handleRoleChange(item._id, event.target.value)}
                          disabled={updatingUserId === item._id}
                        >
                          {roles.map((roleValue) => (
                            <option key={roleValue} value={roleValue}>
                              {roleLabels[roleValue] || roleValue}
                            </option>
                          ))}
                        </select>

                        {!item.isEmailVerified && (
                          <button
                            type="button"
                            className="confirm-email-button"
                            onClick={() => handleManualEmailVerification(item._id)}
                            disabled={verifyingUserId === item._id}
                          >
                            {verifyingUserId === item._id ? 'Confirmation...' : 'Confirmer l\'email'}
                          </button>
                        )}

                        <button
                          type="button"
                          className={item.isActive !== false ? 'suspend-button' : 'activate-button'}
                          onClick={() => handleSuspendUser(item._id, item.isActive !== false)}
                          title={item.isActive !== false ? 'Suspendre le compte' : 'Activer le compte'}
                        >
                          {item.isActive !== false ? '🚫 Suspendre' : '✅ Activer'}
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDeleteUser(item._id)}
                          title="Supprimer définitivement le compte"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    ) : (
                      <span className="badge badge-ghost">Lecture seule</span>
                    )}
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="table-empty">Aucun utilisateur ne correspond à votre recherche.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
