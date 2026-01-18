import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import '../styles/RegistrationDashboard.css';

// Icônes SVG supplémentaires
const UsersIcon = ({ size = 24, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const CheckCircleIcon = ({ size = 24, color = "#2ecc71" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ClockIcon = ({ size = 24, color = "#f39c12" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const XCircleIcon = ({ size = 24, color = "#e74c3c" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

const DollarIcon = ({ size = 24, color = "#9b59b6" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const RefreshIcon = ({ size = 24, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);

const BarChartIcon = ({ size = 24, color = "#667eea" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

const AlertCircleIcon = ({ size = 24, color = "#e74c3c" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const RegistrationDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, paid, partial, unpaid
  const [refugeFilter, setRefugeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // asc, desc
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { token } = useContext(AuthContext);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/registration/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data.registrations || response.data || [];
      setRegistrations(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des inscriptions:', err);
      setError('Impossible de charger les inscriptions');
      setRegistrations([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRegistrations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Fonction de recherche dynamique
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.length >= 2) {
      const results = registrations
        .filter(reg => {
          const searchTerm = query.toLowerCase();
          const fullName = `${reg.firstName || ''} ${reg.lastName || ''}`.toLowerCase();
          const email = (reg.email || '').toLowerCase();
          const phone = (reg.phoneNumber || '').toLowerCase();
          const church = (reg.churchWebsite || '').toLowerCase();
          
          return fullName.includes(searchTerm) || 
                 email.includes(searchTerm) || 
                 phone.includes(searchTerm) ||
                 church.includes(searchTerm);
        })
        .slice(0, 5); // Limiter à 5 résultats
      
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const selectSearchResult = (registration) => {
    setSearchQuery(`${registration.firstName} ${registration.lastName}`);
    setShowSearchResults(false);
    // Scroll vers l'inscription sélectionnée
    const element = document.getElementById(`registration-${registration._id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-row');
      setTimeout(() => element.classList.remove('highlight-row'), 2000);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleDeleteRegistration = async (registrationId, firstName, lastName) => {
    if (!window.confirm(`⚠️ ATTENTION : Cette action est irréversible !\n\nÊtes-vous sûr de vouloir supprimer l'inscription de ${firstName} ${lastName} ?`)) {
      return;
    }

    try {
      await axios.delete(`/api/registration/${registrationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Retirer l'inscription de la liste
      setRegistrations(registrations.filter(reg => reg._id !== registrationId));
      
      alert(`✅ Inscription de ${firstName} ${lastName} supprimée avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('❌ Erreur lors de la suppression de l\'inscription');
    }
  };

  const updatePaymentStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `/api/registration/${id}/payment-status`,
        { paymentStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Rafraîchir les données
      fetchRegistrations();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { text: 'Payé', class: 'status-paid' },
      partial: { text: 'Partiel', class: 'status-partial' },
      unpaid: { text: 'Non payé', class: 'status-unpaid' }
    };
    return badges[status] || badges.unpaid;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filterByDate = (reg) => {
    if (dateFilter === 'all') return true;
    
    const regDate = new Date(reg.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (dateFilter) {
      case 'today':
        return regDate >= today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return regDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return regDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredRegistrations = registrations
    .filter(reg => {
      // Filtre par statut de paiement
      if (filter !== 'all' && reg.paymentStatus !== filter) return false;
      
      // Filtre par refuge
      if (refugeFilter !== 'all' && reg.refuge !== refugeFilter) return false;
      
      // Filtre par date
      if (!filterByDate(reg)) return false;

      // Filtre par recherche
      if (searchQuery.length >= 2) {
        const query = searchQuery.toLowerCase();
        const fullName = `${reg.firstName || ''} ${reg.lastName || ''}`.toLowerCase();
        const email = (reg.email || '').toLowerCase();
        const phone = (reg.phoneNumber || '').toLowerCase();
        const church = (reg.churchWebsite || '').toLowerCase();
        
        return fullName.includes(query) || 
               email.includes(query) || 
               phone.includes(query) ||
               church.includes(query);
      }
      
      return true;
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;
      
      let aVal, bVal;
      
      switch (sortColumn) {
        case 'name':
          aVal = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
          bVal = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
          break;
        case 'email':
          aVal = (a.email || '').toLowerCase();
          bVal = (b.email || '').toLowerCase();
          break;
        case 'refuge':
          aVal = (a.refuge || '').toLowerCase();
          bVal = (b.refuge || '').toLowerCase();
          break;
        case 'amountPaid':
          aVal = a.amountPaid || 0;
          bVal = b.amountPaid || 0;
          break;
        case 'amountRemaining':
          aVal = a.amountRemaining || 0;
          bVal = b.amountRemaining || 0;
          break;
        case 'date':
          aVal = new Date(a.createdAt || 0);
          bVal = new Date(b.createdAt || 0);
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const uniqueRefuges = [...new Set(registrations.map(r => r.refuge).filter(Boolean))].sort();

  const filteredStats = {
    total: filteredRegistrations.length,
    paid: filteredRegistrations.filter(r => r.paymentStatus === 'paid').length,
    partial: filteredRegistrations.filter(r => r.paymentStatus === 'partial').length,
    unpaid: filteredRegistrations.filter(r => r.paymentStatus === 'unpaid').length,
    totalRevenue: filteredRegistrations.reduce((sum, r) => sum + (r.amountPaid || 0), 0),
    totalRemaining: filteredRegistrations.reduce((sum, r) => sum + (r.amountRemaining || 0), 0)
  };

  const stats = {
    total: registrations.length,
    paid: registrations.filter(r => r.paymentStatus === 'paid').length,
    partial: registrations.filter(r => r.paymentStatus === 'partial').length,
    unpaid: registrations.filter(r => r.paymentStatus === 'unpaid').length,
    totalRevenue: registrations.reduce((sum, r) => sum + (r.amountPaid || 0), 0)
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return <span style={{ opacity: 0.3 }}>↕</span>;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">Chargement des inscriptions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-title">
          <BarChartIcon size={32} color="#667eea" />
          <h1>Suivi des Inscriptions</h1>
        </div>
        <button onClick={fetchRegistrations} className="btn-refresh">
          <RefreshIcon size={18} color="#fff" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="search-container">
        <div className="search-box">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone ou église... (min 2 caractères)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="search-clear">✕</button>
          )}
        </div>
        
        {/* Liste de suggestions */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(reg => (
              <div
                key={reg._id}
                className="search-result-item"
                onClick={() => selectSearchResult(reg)}
              >
                <div className="search-result-info">
                  <strong>{reg.firstName} {reg.lastName}</strong>
                  <span className="search-result-email">{reg.email}</span>
                </div>
                <span className={`search-result-status status-${reg.paymentStatus}`}>
                  {reg.paymentStatus === 'paid' ? '✓ Payé' : 
                   reg.paymentStatus === 'partial' ? '⚠ Partiel' : '⏳ Non payé'}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {showSearchResults && searchResults.length === 0 && searchQuery.length >= 2 && (
          <div className="search-results">
            <div className="search-no-results">Aucun résultat trouvé</div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <UsersIcon size={28} color="#667eea" />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total</p>
          </div>
        </div>
        <div className="stat-card stat-paid">
          <div className="stat-icon">
            <CheckCircleIcon size={28} color="#2ecc71" />
          </div>
          <div className="stat-info">
            <h3>{stats.paid}</h3>
            <p>Payées</p>
          </div>
        </div>
        <div className="stat-card stat-partial">
          <div className="stat-icon">
            <ClockIcon size={28} color="#f39c12" />
          </div>
          <div className="stat-info">
            <h3>{stats.partial}</h3>
            <p>Partielles</p>
          </div>
        </div>
        <div className="stat-card stat-revenue">
          <div className="stat-icon">
            <DollarIcon size={28} color="#9b59b6" />
          </div>
          <div className="stat-info">
            <h3>{filteredStats.totalRevenue}€</h3>
            <p>Total payé</p>
          </div>
        </div>
      </div>

      {/* Statistiques filtrées */}
      {(filter !== 'all' || refugeFilter !== 'all' || dateFilter !== 'all') && (
        <div className="filtered-stats">
          <h3>Résultats filtrés: {filteredStats.total} inscription(s)</h3>
          <div className="filtered-stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total payé:</span>
              <span className="stat-value">{filteredStats.totalRevenue}€</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total restant:</span>
              <span className="stat-value">{filteredStats.totalRemaining}€</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Moyenne payée:</span>
              <span className="stat-value">
                {filteredStats.total > 0 ? (filteredStats.totalRevenue / filteredStats.total).toFixed(2) : 0}€
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="dashboard-filters">
        <div className="filter-group">
          <label>Statut:</label>
          <button 
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            Toutes ({stats.total})
          </button>
          <button 
            className={filter === 'paid' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('paid')}
          >
            Payées ({stats.paid})
          </button>
          <button 
            className={filter === 'partial' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('partial')}
          >
            Partielles ({stats.partial})
          </button>
        </div>

        <div className="filter-group">
          <label>Refuge:</label>
          <select 
            value={refugeFilter} 
            onChange={(e) => setRefugeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les refuges</option>
            {uniqueRefuges.map(refuge => (
              <option key={refuge} value={refuge}>{refuge}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Période:</label>
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
      </div>

      {/* Tableau des inscriptions */}
      <div className="dashboard-table-container" style={{ overflowX: 'auto', width: '100%' }}>
        <table className="dashboard-table" style={{ minWidth: '1400px' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                Date <SortIcon column="date" />
              </th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Nom complet <SortIcon column="name" />
              </th>
              <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                Email <SortIcon column="email" />
              </th>
              <th>Téléphone</th>
              <th>Sexe</th>
              <th>Date naissance</th>
              <th>Adresse</th>
              <th onClick={() => handleSort('refuge')} style={{ cursor: 'pointer' }}>
                Refuge <SortIcon column="refuge" />
              </th>
              <th>Allergies</th>
              <th onClick={() => handleSort('amountPaid')} style={{ cursor: 'pointer' }}>
                Montant payé <SortIcon column="amountPaid" />
              </th>
              <th onClick={() => handleSort('amountRemaining')} style={{ cursor: 'pointer' }}>
                Reste <SortIcon column="amountRemaining" />
              </th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.length === 0 ? (
              <tr>
                <td colSpan="13" className="no-data">
                  Aucune inscription trouvée
                </td>
              </tr>
            ) : (
              <>
                {filteredRegistrations.map((reg) => (
                  <tr key={reg._id} id={`registration-${reg._id}`} className="registration-row">
                    <td>{formatDate(reg.createdAt)}</td>
                    <td className="name-cell">
                      {reg.firstName} {reg.lastName}
                    </td>
                    <td>{reg.email}</td>
                    <td>{reg.phone}</td>
                    <td>{reg.sex === 'M' ? 'Homme' : 'Femme'}</td>
                    <td>{formatDate(reg.dateOfBirth)}</td>
                    <td>
                      {reg.address ? (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(reg.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#667eea', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Ouvrir dans Google Maps"
                        >
                          📍 {reg.address}
                        </a>
                      ) : '—'}
                    </td>
                    <td>{reg.refuge}</td>
                    <td>
                      {reg.hasAllergies ? (
                        <span className="has-allergies" title={reg.allergyDetails}>
                          <AlertCircleIcon size={18} color="#e74c3c" />
                        </span>
                      ) : (
                        <CheckCircleIcon size={18} color="#2ecc71" />
                      )}
                    </td>
                    <td className="amount-cell">{reg.amountPaid}€</td>
                    <td className="amount-cell">{reg.amountRemaining}€</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(reg.paymentStatus).class}`}>
                        {getStatusBadge(reg.paymentStatus).text}
                      </span>
                    </td>
                    <td>
                      <button
                        className="delete-registration-btn"
                        onClick={() => handleDeleteRegistration(reg._id, reg.firstName, reg.lastName)}
                        title="Supprimer l'inscription"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                
                {/* Ligne de totaux */}
                <tr className="totals-row">
                  <td colSpan="9" style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    TOTAUX ({filteredRegistrations.length} inscriptions):
                  </td>
                  <td className="amount-cell" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {filteredStats.totalRevenue}€
                  </td>
                  <td className="amount-cell" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {filteredStats.totalRemaining}€
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationDashboard;

