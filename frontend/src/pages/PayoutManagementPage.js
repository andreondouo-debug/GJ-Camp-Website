import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/PayoutManagement.css';

const CAMPUS_LIST = ['Lorient', 'Laval', 'Amiens', 'Nantes', 'Autres'];

const STATUS_LABELS = {
  pending: 'En attente',
  processing: 'En cours',
  success: 'Envoyé',
  failed: 'Échec',
  cancelled: 'Annulé',
};

const STATUS_COLORS = {
  pending: '#f1c40f',
  processing: '#3498db',
  success: '#2ecc71',
  failed: '#e74c3c',
  cancelled: '#95a5a6',
};

function PayoutManagementPage() {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('payouts'); // payouts | campus | stats
  
  // Payouts
  const [payouts, setPayouts] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [filters, setFilters] = useState({ campus: '', status: '' });
  
  // Campus
  const [campusList, setCampusList] = useState([]);
  const [editingCampus, setEditingCampus] = useState(null);
  const [campusForm, setCampusForm] = useState({
    name: '',
    paypalEmail: '',
    iban: '',
    redistributionPercentage: 100,
    isActive: true,
    contactPerson: { name: '', email: '', phone: '' },
    notes: '',
  });
  
  // Stats
  const [statistics, setStatistics] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  useEffect(() => {
    if (activeTab === 'payouts') {
      fetchPayouts();
    } else if (activeTab === 'campus') {
      fetchCampus();
    } else if (activeTab === 'stats') {
      fetchStatistics();
    }
  }, [activeTab, filters]);

  const fetchPayouts = async () => {
    setLoadingPayouts(true);
    try {
      const params = new URLSearchParams();
      if (filters.campus) params.append('campus', filters.campus);
      if (filters.status) params.append('status', filters.status);

      const response = await axios.get(`/api/payouts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPayouts(response.data.payouts || []);
    } catch (error) {
      console.error('❌ Erreur récupération payouts:', error);
      setFeedback({ type: 'error', message: 'Impossible de charger les redistributions' });
    } finally {
      setLoadingPayouts(false);
    }
  };

  const fetchCampus = async () => {
    try {
      const response = await axios.get('/api/campus', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // La réponse est maintenant directement un tableau de campus
      setCampusList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Erreur récupération campus:', error);
      setFeedback({ type: 'error', message: 'Impossible de charger les campus' });
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/payouts/statistics', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data || {};
      setStatistics({
        byStatus: data.byStatus || [],
        byCampus: data.byCampus || []
      });
    } catch (error) {
      console.error('❌ Erreur récupération statistiques:', error);
      setFeedback({ type: 'error', message: 'Impossible de charger les statistiques' });
      setStatistics({
        byStatus: [],
        byCampus: []
      });
    }
  };

  const handleExecutePayouts = async () => {
    if (!window.confirm('Exécuter la redistribution des paiements en attente ?')) return;

    setExecuting(true);
    setFeedback({ type: null, message: '' });

    try {
      const response = await axios.post('/api/payouts/execute', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFeedback({ type: 'success', message: response.data.message });
      fetchPayouts();
      fetchStatistics();
    } catch (error) {
      console.error('❌ Erreur exécution payouts:', error);
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Erreur lors de l\'exécution' });
    } finally {
      setExecuting(false);
    }
  };

  const handleRefreshPayoutStatus = async (payoutId) => {
    try {
      const response = await axios.get(`/api/payouts/${payoutId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFeedback({ type: 'success', message: `Statut mis à jour: ${STATUS_LABELS[response.data.status]}` });
      fetchPayouts();
    } catch (error) {
      console.error('❌ Erreur rafraîchissement statut:', error);
      setFeedback({ type: 'error', message: 'Impossible de vérifier le statut' });
    }
  };

  const handleRefreshAllProcessing = async () => {
    const processingPayouts = payouts.filter(p => p.status === 'processing');
    if (processingPayouts.length === 0) {
      setFeedback({ type: 'info', message: 'Aucun payout en cours à vérifier' });
      return;
    }

    setFeedback({ type: null, message: '' });
    let updated = 0;

    for (const payout of processingPayouts) {
      try {
        await axios.get(`/api/payouts/${payout._id}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        updated++;
      } catch (error) {
        console.error(`Erreur payout ${payout._id}:`, error);
      }
    }

    setFeedback({ type: 'success', message: `${updated} payout(s) vérifié(s)` });
    fetchPayouts();
  };

  const handleSaveCampus = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: '' });

    try {
      const response = await axios.post('/api/campus', campusForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFeedback({ type: 'success', message: response.data.message });
      setEditingCampus(null);
      setCampusForm({
        name: '',
        paypalEmail: '',
        iban: '',
        redistributionPercentage: 100,
        isActive: true,
        contactPerson: { name: '', email: '', phone: '' },
        notes: '',
      });
      fetchCampus();
    } catch (error) {
      console.error('❌ Erreur sauvegarde campus:', error);
      setFeedback({ type: 'error', message: error.response?.data?.message || 'Erreur lors de la sauvegarde' });
    }
  };

  const handleEditCampus = (campus) => {
    setEditingCampus(campus.name);
    setCampusForm({
      name: campus.name,
      paypalEmail: campus.paypalEmail || '',
      iban: campus.iban || '',
      redistributionPercentage: campus.redistributionPercentage || 100,
      isActive: campus.isActive !== undefined ? campus.isActive : true,
      contactPerson: campus.contactPerson || { name: '', email: '', phone: '' },
      notes: campus.notes || '',
    });
  };

  return (
    <div className="payout-management-container">
      <div className="payout-card">
        <div className="payout-header">
          <h1>💰 Gestion des Redistributions</h1>
          <p>Gérez les paiements redistribués aux campus selon les inscriptions</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'payouts' ? 'active' : ''}`}
            onClick={() => setActiveTab('payouts')}
          >
            📋 Redistributions
          </button>
          <button
            className={`tab ${activeTab === 'campus' ? 'active' : ''}`}
            onClick={() => setActiveTab('campus')}
          >
            🏢 Campus
          </button>
          <button
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistiques
          </button>
        </div>

        {/* Feedback */}
        {feedback.message && (
          <div className={`feedback feedback-${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        {/* Tab: Payouts */}
        {activeTab === 'payouts' && (
          <div className="tab-content">
            <div className="actions-bar">
              <button
                className="btn-execute"
                onClick={handleExecutePayouts}
                disabled={executing}
              >
                {executing ? '⏳ Exécution...' : '🚀 Redistribuer maintenant'}
              </button>
              <button
                className="btn-execute"
                onClick={handleRefreshAllProcessing}
                style={{ marginLeft: '10px', backgroundColor: '#3498db' }}
              >
                🔄 Vérifier statuts PayPal
              </button>
            </div>

            <div className="filters-row">
              <select
                value={filters.campus}
                onChange={(e) => setFilters({ ...filters, campus: e.target.value })}
              >
                <option value="">Tous les campus</option>
                {CAMPUS_LIST.map((campus) => (
                  <option key={campus} value={campus}>{campus}</option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="processing">En cours</option>
                <option value="success">Envoyé</option>
                <option value="failed">Échec</option>
              </select>
            </div>

            {loadingPayouts ? (
              <div className="loading">Chargement des redistributions...</div>
            ) : (
              <div className="payouts-table">
                {payouts.length === 0 ? (
                  <div className="empty-state">Aucune redistribution trouvée</div>
                ) : (
                  payouts.map((payout) => (
                    <div key={payout._id} className="payout-row">
                      <div className="payout-info">
                        <div className="payout-campus">{payout.campus}</div>
                        <div className="payout-recipient">{payout.recipientEmail}</div>
                        <div className="payout-registration">
                          {payout.registration?.firstName} {payout.registration?.lastName}
                        </div>
                      </div>
                      <div className="payout-amount">
                        <div className="amount-main">{payout.amount.toFixed(2)} €</div>
                        <div className="amount-detail">
                          {payout.redistributionPercentage}% de {payout.originalAmount.toFixed(2)} €
                        </div>
                      </div>
                      <div className="payout-status">
                        <span
                          className="status-badge"
                          style={{ backgroundColor: STATUS_COLORS[payout.status] }}
                        >
                          {STATUS_LABELS[payout.status]}
                        </span>
                        {payout.status === 'processing' && (
                          <button
                            onClick={() => handleRefreshPayoutStatus(payout._id)}
                            style={{
                              marginLeft: '8px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              backgroundColor: '#3498db',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            title="Vérifier le statut auprès de PayPal"
                          >
                            🔄
                          </button>
                        )}
                        <div className="payout-date">
                          {new Date(payout.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab: Campus */}
        {activeTab === 'campus' && (
          <div className="tab-content">
            <form className="campus-form" onSubmit={handleSaveCampus}>
              <h3>{editingCampus ? `Modifier ${editingCampus}` : 'Ajouter un campus'}</h3>

              <div className="form-row">
                <label>
                  Campus <span className="required">*</span>
                  <select
                    value={campusForm.name}
                    onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })}
                    required
                    disabled={editingCampus}
                  >
                    <option value="">Sélectionner un campus</option>
                    {CAMPUS_LIST.map((campus) => (
                      <option key={campus} value={campus}>{campus}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Email PayPal <span className="required">*</span>
                  <input
                    type="email"
                    value={campusForm.paypalEmail}
                    onChange={(e) => setCampusForm({ ...campusForm, paypalEmail: e.target.value })}
                    placeholder="paypal@campus.com"
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  IBAN (optionnel)
                  <input
                    type="text"
                    value={campusForm.iban}
                    onChange={(e) => setCampusForm({ ...campusForm, iban: e.target.value.toUpperCase() })}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                  />
                </label>

                <label>
                  Pourcentage redistribution
                  <input
                    type="number"
                    value={campusForm.redistributionPercentage}
                    onChange={(e) => setCampusForm({ ...campusForm, redistributionPercentage: parseFloat(e.target.value) })}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </label>
              </div>

              <label>
                <input
                  type="checkbox"
                  checked={campusForm.isActive}
                  onChange={(e) => setCampusForm({ ...campusForm, isActive: e.target.checked })}
                />
                Campus actif
              </label>

              <div className="form-actions">
                <button type="submit" className="btn-save">Enregistrer</button>
                {editingCampus && (
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setEditingCampus(null);
                      setCampusForm({
                        name: '',
                        paypalEmail: '',
                        iban: '',
                        redistributionPercentage: 100,
                        isActive: true,
                        contactPerson: { name: '', email: '', phone: '' },
                        notes: '',
                      });
                    }}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>

            <div className="campus-list">
              <h3>Campus configurés</h3>
              {campusList.length === 0 ? (
                <div className="empty-state">Aucun campus configuré</div>
              ) : (
                campusList.map((campus) => (
                  <div key={campus._id} className="campus-item">
                    <div className="campus-header">
                      <h4>{campus.name}</h4>
                      <span className={`campus-status ${campus.isActive ? 'active' : 'inactive'}`}>
                        {campus.isActive ? '✅ Actif' : '❌ Inactif'}
                      </span>
                    </div>
                    <div className="campus-details">
                      <p>📧 PayPal: {campus.paypalEmail || 'Non configuré'}</p>
                      <p>💵 Redistribution: {campus.redistributionPercentage}%</p>
                      {campus.iban && <p>🏦 IBAN: {campus.iban}</p>}
                    </div>
                    <button
                      className="btn-edit"
                      onClick={() => handleEditCampus(campus)}
                    >
                      ✏️ Modifier
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab: Statistics */}
        {activeTab === 'stats' && (
          <div className="tab-content">
            {statistics ? (
              <>
                {/* Vue d'ensemble globale */}
                <div className="stats-overview">
                  <h3>📊 Vue d'ensemble</h3>
                  <div className="stats-summary">
                    <div className="summary-card total">
                      <div className="summary-icon">💰</div>
                      <div className="summary-content">
                        <div className="summary-label">Total Redistribué</div>
                        <div className="summary-value">
                          {statistics.byStatus?.reduce((sum, stat) => sum + stat.totalAmount, 0).toFixed(2)} €
                        </div>
                        <div className="summary-subtitle">
                          {statistics.byStatus?.reduce((sum, stat) => sum + stat.count, 0)} redistributions
                        </div>
                      </div>
                    </div>

                    <div className="summary-card success">
                      <div className="summary-icon">✅</div>
                      <div className="summary-content">
                        <div className="summary-label">Réussis</div>
                        <div className="summary-value">
                          {(statistics.byStatus?.find(s => s._id === 'success')?.totalAmount || 0).toFixed(2)} €
                        </div>
                        <div className="summary-subtitle">
                          {statistics.byStatus?.find(s => s._id === 'success')?.count || 0} paiements
                        </div>
                      </div>
                    </div>

                    <div className="summary-card pending">
                      <div className="summary-icon">⏳</div>
                      <div className="summary-content">
                        <div className="summary-label">En Attente</div>
                        <div className="summary-value">
                          {(statistics.byStatus?.find(s => s._id === 'pending')?.totalAmount || 0).toFixed(2)} €
                        </div>
                        <div className="summary-subtitle">
                          {statistics.byStatus?.find(s => s._id === 'pending')?.count || 0} paiements
                        </div>
                      </div>
                    </div>

                    <div className="summary-card fees">
                      <div className="summary-icon">🏦</div>
                      <div className="summary-content">
                        <div className="summary-label">Frais PayPal</div>
                        <div className="summary-value">
                          {statistics.byStatus?.reduce((sum, stat) => sum + (stat.totalFees || 0), 0).toFixed(2)} €
                        </div>
                        <div className="summary-subtitle">
                          Coût total des transactions
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques par statut */}
                <div className="stats-section">
                  <h3>📈 Répartition par Statut</h3>
                  <div className="stats-grid">
                    {statistics.byStatus?.map((stat) => (
                      <div key={stat._id} className="stat-card" style={{ borderLeft: `4px solid ${STATUS_COLORS[stat._id]}` }}>
                        <div className="stat-header">
                          <span className="stat-badge" style={{ backgroundColor: STATUS_COLORS[stat._id] }}>
                            {STATUS_LABELS[stat._id] || stat._id}
                          </span>
                        </div>
                        <div className="stat-body">
                          <div className="stat-main">
                            <div className="stat-count">{stat.count}</div>
                            <div className="stat-label">redistribution{stat.count > 1 ? 's' : ''}</div>
                          </div>
                          <div className="stat-divider"></div>
                          <div className="stat-details">
                            <div className="stat-row">
                              <span className="stat-label-small">Montant total</span>
                              <span className="stat-value-large">{stat.totalAmount.toFixed(2)} €</span>
                            </div>
                            {stat.totalFees > 0 && (
                              <div className="stat-row">
                                <span className="stat-label-small">Frais PayPal</span>
                                <span className="stat-value-small">{stat.totalFees.toFixed(2)} €</span>
                              </div>
                            )}
                            <div className="stat-row">
                              <span className="stat-label-small">Montant moyen</span>
                              <span className="stat-value-small">{(stat.totalAmount / stat.count).toFixed(2)} €</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistiques par campus */}
                <div className="stats-section">
                  <h3>🏕️ Répartition par Campus</h3>
                  <div className="stats-grid campus-grid">
                    {statistics.byCampus?.map((stat) => (
                      <div key={stat._id} className="stat-card campus-card">
                        <div className="campus-header">
                          <h4>{stat._id}</h4>
                          <span className="campus-badge">{stat.count} paiements</span>
                        </div>
                        <div className="campus-body">
                          <div className="campus-amount">
                            <span className="amount-label">Montant total</span>
                            <span className="amount-value">{stat.totalAmount.toFixed(2)} €</span>
                          </div>
                          <div className="campus-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-success" 
                                style={{ width: `${(stat.successCount / stat.count) * 100}%` }}
                              ></div>
                            </div>
                            <div className="progress-labels">
                              <span className="progress-success-label">✅ {stat.successCount} réussis</span>
                              <span className="progress-failed-label">❌ {stat.failedCount} échoués</span>
                            </div>
                          </div>
                          <div className="campus-stats-detail">
                            <div className="detail-item">
                              <span className="detail-icon">📊</span>
                              <span className="detail-text">Taux de réussite: {((stat.successCount / stat.count) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-icon">💵</span>
                              <span className="detail-text">Moyen: {(stat.totalAmount / stat.count).toFixed(2)} €</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="loading">Chargement des statistiques...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PayoutManagementPage;
