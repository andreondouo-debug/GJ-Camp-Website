import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/CashPayments.css';

const CashPaymentsManagement = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [validationAmount, setValidationAmount] = useState({});
  const [validationNote, setValidationNote] = useState({});
  const [rejectionReason, setRejectionReason] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/registrations/cash/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data || {};
      // Vérifier la structure et ajouter les valeurs par défaut si nécessaire
      const stats = {
        pendingPayments: data.pendingPayments || data.pending || [],
        validatedPayments: data.validatedPayments || data.validated || [],
        rejectedPayments: data.rejectedPayments || data.rejected || [],
        totalPending: data.totalPending || 0,
        totalValidated: data.totalValidated || 0,
        totalRejected: data.totalRejected || 0
      };
      setStats(stats);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
      // Initialiser avec des valeurs par défaut en cas d'erreur
      setStats({
        pendingPayments: [],
        validatedPayments: [],
        rejectedPayments: [],
        totalPending: 0,
        totalValidated: 0,
        totalRejected: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (registrationId, paymentId, originalAmount) => {
    try {
      setMessage(null);
      setError(null);

      const amount = validationAmount[paymentId] || originalAmount;
      const note = validationNote[paymentId] || '';

      const response = await axios.patch(
        `/api/registrations/${registrationId}/cash-payment/${paymentId}/validate`,
        { amount: parseFloat(amount), note },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`✅ Paiement de ${amount}€ validé avec succès`);
      
      // 🔔 Déclencher événement pour rafraîchir le badge Header
      window.dispatchEvent(new Event('cashPaymentsUpdated'));
      
      // Réinitialiser les champs
      setValidationAmount(prev => {
        const newState = { ...prev };
        delete newState[paymentId];
        return newState;
      });
      setValidationNote(prev => {
        const newState = { ...prev };
        delete newState[paymentId];
        return newState;
      });

      // Recharger les stats
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la validation');
    }
  };

  const handleReject = async (registrationId, paymentId) => {
    if (!rejectionReason[paymentId]) {
      setError('Veuillez indiquer une raison de rejet');
      return;
    }

    try {
      setMessage(null);
      setError(null);

      await axios.patch(
        `/api/registrations/${registrationId}/cash-payment/${paymentId}/reject`,
        { reason: rejectionReason[paymentId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('❌ Paiement rejeté');
      
      // 🔔 Déclencher événement pour rafraîchir le badge Header
      window.dispatchEvent(new Event('cashPaymentsUpdated'));
      
      // Réinitialiser le champ
      setRejectionReason(prev => {
        const newState = { ...prev };
        delete newState[paymentId];
        return newState;
      });

      // Recharger les stats
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du rejet');
    }
  };

  if (loading) {
    return (
      <div className="cash-payments-container">
        <div className="loading">⏳ Chargement des paiements en espèces...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="cash-payments-container">
        <div className="error">❌ Impossible de charger les données</div>
      </div>
    );
  }

  return (
    <div className="cash-payments-container">
      <div className="cash-payments-header">
        <h1>💵 Gestion des Paiements en Espèces</h1>
        <button onClick={fetchStats} className="refresh-btn">🔄 Actualiser</button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Statistiques globales */}
      <div className="stats-grid">
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingPayments.length}</h3>
            <p>En attente</p>
            <span className="stat-amount">{stats.totalPending.toFixed(2)}€</span>
          </div>
        </div>

        <div className="stat-card validated">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.validatedPayments.length}</h3>
            <p>Validés</p>
            <span className="stat-amount">{stats.totalValidated.toFixed(2)}€</span>
          </div>
        </div>

        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{stats.rejectedPayments.length}</h3>
            <p>Rejetés</p>
            <span className="stat-amount">{stats.totalRejected.toFixed(2)}€</span>
          </div>
        </div>

        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.totalCashRegistrations}</h3>
            <p>Inscriptions espèces</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ En attente ({stats.pendingPayments.length})
        </button>
        <button 
          className={`tab ${activeTab === 'validated' ? 'active' : ''}`}
          onClick={() => setActiveTab('validated')}
        >
          ✅ Validés ({stats.validatedPayments.length})
        </button>
        <button 
          className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          ❌ Rejetés ({stats.rejectedPayments.length})
        </button>
      </div>

      {/* Liste des paiements */}
      <div className="payments-list">
        {activeTab === 'pending' && (
          <>
            {stats.pendingPayments.length === 0 ? (
              <div className="empty-state">
                <p>✅ Aucun paiement en attente</p>
              </div>
            ) : (
              stats.pendingPayments.map(payment => (
                <div key={payment.paymentId} className="payment-card pending-card">
                  <div className="payment-header">
                    <div className="user-info">
                      <h3>{payment.userName}</h3>
                      <p>{payment.userEmail}</p>
                    </div>
                    <div className="payment-amount">
                      <span className="amount">{payment.amount}€</span>
                      <span className="label">Montant déclaré</span>
                    </div>
                  </div>

                  <div className="payment-details">
                    <div className="detail">
                      <span className="label">📍 Refuge :</span>
                      <span className="value">{payment.refuge}</span>
                    </div>
                    <div className="detail">
                      <span className="label">📅 Soumis le :</span>
                      <span className="value">{new Date(payment.submittedAt).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="validation-section">
                    <div className="validation-inputs">
                      <div className="input-group">
                        <label>Montant validé (€)</label>
                        <input
                          type="number"
                          placeholder={payment.amount}
                          value={validationAmount[payment.paymentId] || ''}
                          onChange={(e) => setValidationAmount(prev => ({
                            ...prev,
                            [payment.paymentId]: e.target.value
                          }))}
                          min="0"
                          max="120"
                          step="0.01"
                        />
                      </div>

                      <div className="input-group">
                        <label>Note (optionnel)</label>
                        <input
                          type="text"
                          placeholder="Ex: Reçu le 05/12/2025"
                          value={validationNote[payment.paymentId] || ''}
                          onChange={(e) => setValidationNote(prev => ({
                            ...prev,
                            [payment.paymentId]: e.target.value
                          }))}
                        />
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button 
                        className="validate-btn"
                        onClick={() => handleValidate(
                          payment.registrationId, 
                          payment.paymentId,
                          payment.amount
                        )}
                      >
                        ✅ Valider
                      </button>

                      <div className="reject-group">
                        <input
                          type="text"
                          placeholder="Raison du rejet"
                          value={rejectionReason[payment.paymentId] || ''}
                          onChange={(e) => setRejectionReason(prev => ({
                            ...prev,
                            [payment.paymentId]: e.target.value
                          }))}
                          className="reject-input"
                        />
                        <button 
                          className="reject-btn"
                          onClick={() => handleReject(payment.registrationId, payment.paymentId)}
                        >
                          ❌ Rejeter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'validated' && (
          <>
            {stats.validatedPayments.length === 0 ? (
              <div className="empty-state">
                <p>Aucun paiement validé</p>
              </div>
            ) : (
              stats.validatedPayments.map(payment => (
                <div key={payment.paymentId} className="payment-card validated-card">
                  <div className="payment-header">
                    <div className="user-info">
                      <h3>{payment.userName}</h3>
                      <p>{payment.userEmail}</p>
                    </div>
                    <div className="payment-amount">
                      <span className="amount">{payment.amount}€</span>
                      <span className="label success">✅ Validé</span>
                    </div>
                  </div>

                  <div className="payment-details">
                    <div className="detail">
                      <span className="label">📍 Refuge :</span>
                      <span className="value">{payment.refuge}</span>
                    </div>
                    <div className="detail">
                      <span className="label">📅 Validé le :</span>
                      <span className="value">{new Date(payment.validatedAt).toLocaleString('fr-FR')}</span>
                    </div>
                    {payment.note && (
                      <div className="detail">
                        <span className="label">📝 Note :</span>
                        <span className="value">{payment.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'rejected' && (
          <>
            {stats.rejectedPayments.length === 0 ? (
              <div className="empty-state">
                <p>Aucun paiement rejeté</p>
              </div>
            ) : (
              stats.rejectedPayments.map(payment => (
                <div key={payment.paymentId} className="payment-card rejected-card">
                  <div className="payment-header">
                    <div className="user-info">
                      <h3>{payment.userName}</h3>
                      <p>{payment.userEmail}</p>
                    </div>
                    <div className="payment-amount">
                      <span className="amount">{payment.amount}€</span>
                      <span className="label rejected">❌ Rejeté</span>
                    </div>
                  </div>

                  <div className="payment-details">
                    <div className="detail">
                      <span className="label">📍 Refuge :</span>
                      <span className="value">{payment.refuge}</span>
                    </div>
                    <div className="detail">
                      <span className="label">📅 Rejeté le :</span>
                      <span className="value">{new Date(payment.validatedAt).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CashPaymentsManagement;
