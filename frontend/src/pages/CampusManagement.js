import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/CampusManagement.css';

const CampusManagement = () => {
  const { token } = useContext(AuthContext);
  const [campus, setCampus] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les campus
      const campusResponse = await axios.get('/api/campus');
      const campusData = campusResponse.data;
      
      // Peupler les responsables pour chaque campus
      const populatedCampus = await Promise.all(
        campusData.map(async (c) => {
          if (c.responsable) {
            try {
              const respResponse = await axios.get(`/api/campus/${c.name}/responsable`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return {
                ...c,
                responsableDetails: respResponse.data.responsable
              };
            } catch (err) {
              return c;
            }
          }
          return c;
        })
      );
      
      setCampus(populatedCampus);

      // Récupérer les utilisateurs avec rôle de gestion (referent, responsable, admin)
      const usersResponse = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filtrer pour ne garder que les utilisateurs avec rôle de gestion
      const managementUsers = usersResponse.data.users.filter(user => 
        ['referent', 'responsable', 'admin'].includes(user.role)
      );
      
      setUsers(managementUsers);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignResponsable = async (campusName, userId) => {
    try {
      setMessage(null);
      setError(null);

      const response = await axios.patch(
        `/api/campus/${campusName}/responsable`,
        { userId: userId || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.message);
      
      // Recharger les données
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'affectation');
    }
  };

  if (loading) {
    return (
      <div className="campus-management-container">
        <div className="loading">⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="campus-management-container">
      <div className="campus-management-header">
        <h1>🏛️ Gestion des Campus et Responsables</h1>
        <button onClick={fetchData} className="refresh-btn">🔄 Actualiser</button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="campus-grid">
        {campus.map((c) => (
          <div key={c._id} className="campus-card">
            <div className="campus-card-header">
              <h2>{c.name}</h2>
              <span className={`status-badge ${c.isActive ? 'active' : 'inactive'}`}>
                {c.isActive ? '✅ Actif' : '❌ Inactif'}
              </span>
            </div>

            <div className="campus-card-body">
              <div className="info-row">
                <span className="label">📧 PayPal:</span>
                <span className="value">{c.paypalEmail || 'Non configuré'}</span>
              </div>

              <div className="info-row">
                <span className="label">🏦 IBAN:</span>
                <span className="value">{c.iban || 'Non configuré'}</span>
              </div>

              <div className="info-row">
                <span className="label">💰 Redistribution:</span>
                <span className="value">{c.redistributionPercentage}%</span>
              </div>

              <div className="responsable-section">
                <h3>👤 Responsable des Paiements en Espèces - Campus {c.name}</h3>
                
                {c.responsableDetails ? (
                  <div className="current-responsable">
                    <div className="responsable-info">
                      <p><strong>{c.responsableDetails.firstName} {c.responsableDetails.lastName}</strong></p>
                      <p className="role-badge">{c.responsableDetails.role}</p>
                      <p>📧 {c.responsableDetails.email}</p>
                      {c.responsableDetails.phoneNumber && (
                        <p>📱 {c.responsableDetails.phoneNumber}</p>
                      )}
                      <p className="campus-label">🏛️ Campus : <strong>{c.name}</strong></p>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => handleAssignResponsable(c.name, null)}
                    >
                      ❌ Retirer
                    </button>
                  </div>
                ) : (
                  <p className="no-responsable">Aucun responsable affecté</p>
                )}

                <div className="assign-responsable">
                  <label>Affecter un nouveau responsable au campus {c.name}:</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAssignResponsable(c.name, e.target.value);
                        e.target.value = ''; // Reset après sélection
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">-- Sélectionner un utilisateur --</option>
                    {users.map(user => (
                      <option 
                        key={user._id} 
                        value={user._id}
                        disabled={c.responsable === user._id}
                      >
                        {user.firstName} {user.lastName} ({user.role}) - {user.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {c.notes && (
                <div className="campus-notes">
                  <span className="label">📝 Notes:</span>
                  <p>{c.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="info-box">
        <h3>ℹ️ Informations</h3>
        <ul>
          <li>Seuls les utilisateurs avec un rôle <strong>referent</strong>, <strong>responsable</strong> ou <strong>admin</strong> peuvent être affectés</li>
          <li>Le responsable d'un campus peut valider ou rejeter les paiements en espèces pour son campus</li>
          <li>Les administrateurs peuvent valider les paiements de tous les campus</li>
          <li>Un utilisateur peut être responsable de plusieurs campus</li>
        </ul>
      </div>
    </div>
  );
};

export default CampusManagement;
