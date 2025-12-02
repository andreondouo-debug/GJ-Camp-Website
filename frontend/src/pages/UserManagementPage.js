import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
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
