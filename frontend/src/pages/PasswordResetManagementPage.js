import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  RefreshIcon, 
  CheckIcon, 
  XIcon, 
  ClockIcon, 
  UserIcon, 
  MailIcon,
  AlertTriangleIcon 
} from '../components/Icons';
import '../styles/App.css';

const PasswordResetManagementPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/password-reset/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data || {};
      const requests = Array.isArray(data) ? data : (data.requests || []);
      setRequests(requests);
      console.log(`📋 ${data.count || requests.length} demandes de réinitialisation en attente`);
    } catch (err) {
      console.error('Erreur lors du chargement des demandes:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir approuver cette demande ? Un email sera envoyé à l\'utilisateur.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/password-reset/approve/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(`✅ ${response.data.message}`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Rafraîchir la liste
      fetchPendingRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'approbation');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/password-reset/reject/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('❌ Demande rejetée');
      setTimeout(() => setSuccess(''), 3000);
      
      // Rafraîchir la liste
      fetchPendingRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du rejet');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshIcon size={40} color="#a01e1e" />
          <p>Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            🔐 Demandes de réinitialisation
            {requests.length > 0 && (
              <span style={{ 
                backgroundColor: '#a01e1e', 
                color: 'white', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '16px' 
              }}>
                {requests.length}
              </span>
            )}
          </h1>
          <button 
            onClick={fetchPendingRequests}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#001a4d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <RefreshIcon size={18} color="white" />
            Actualiser
          </button>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangleIcon size={20} color="#721c24" />
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px' 
          }}>
            {success}
          </div>
        )}

        {requests.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px'
          }}>
            <p style={{ fontSize: '18px', color: '#666', margin: 0 }}>
              ✅ Aucune demande en attente
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {requests.map((request) => (
              <div
                key={request._id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start',
                  marginBottom: '15px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <UserIcon size={20} color="#333" />
                      <h3 style={{ margin: 0, fontSize: '18px' }}>
                        {request.firstName} {request.lastName}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <MailIcon size={18} color="#666" />
                      <span style={{ color: '#666' }}>{request.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ClockIcon size={18} color="#666" />
                      <span style={{ color: '#666', fontSize: '14px' }}>
                        Demandé le {formatDate(request.resetPasswordRequestedAt)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleApprove(request._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      <CheckIcon size={18} color="white" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      <XIcon size={18} color="white" />
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordResetManagementPage;
