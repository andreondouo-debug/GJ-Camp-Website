import React, { useState } from 'react';
import PayPalButton from '../components/PayPalButton';
import '../styles/RegistrationNew.css';

const PayPalTestPage = () => {
  const [amount, setAmount] = useState(20);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSuccess = (details) => {
    console.log('✅ Détails du paiement:', details);
    setMessage(`✅ Paiement réussi ! Transaction ID: ${details.id}`);
    setError(null);
  };

  const handleError = (err) => {
    console.error('❌ Erreur paiement:', err);
    setError('❌ Erreur lors du paiement');
    setMessage(null);
  };

  const handleCancel = () => {
    console.log('⚠️ Paiement annulé');
    setMessage('⚠️ Paiement annulé');
    setError(null);
  };

  return (
    <div className="registration-new-page">
      <div className="registration-container">
        <div className="registration-card">
          <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
            💳 Test PayPal - Sandbox
          </h1>

          <div style={{
            background: '#e0f2fe',
            border: '2px solid #0284c7',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#0369a1', marginBottom: '15px' }}>ℹ️ Mode Test</h3>
            <p style={{ marginBottom: '10px' }}>
              <strong>Utilisez une carte de test PayPal :</strong>
            </p>
            <div style={{ 
              background: 'white', 
              padding: '15px', 
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}>
              <div><strong>Visa :</strong> 4032039847809776</div>
              <div><strong>CVV :</strong> 123</div>
              <div><strong>Date :</strong> 12/28</div>
            </div>
          </div>

          {message && (
            <div style={{
              background: '#d1fae5',
              border: '2px solid #10b981',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              color: '#065f46'
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '2px solid #ef4444',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              color: '#991b1b'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#333'
            }}>
              Montant à tester (€)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '18px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '600'
              }}
            />
            <div style={{
              marginTop: '10px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              {[20, 50, 60, 100, 120].map(val => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  style={{
                    padding: '8px 16px',
                    background: amount === val ? '#667eea' : '#f3f4f6',
                    color: amount === val ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {val}€
                </button>
              ))}
            </div>
          </div>

          <div style={{
            background: '#f9fafb',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>
              💰 Montant à payer : {amount}€
            </h3>
            
            <PayPalButton
              amount={amount}
              onSuccess={handleSuccess}
              onError={handleError}
              onCancel={handleCancel}
            />
          </div>

          <div style={{
            background: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '8px',
            padding: '15px',
            fontSize: '14px'
          }}>
            <strong>⚠️ Mode Sandbox :</strong>
            <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>Aucun vrai paiement</li>
              <li>Utilisez les cartes de test PayPal</li>
              <li>Tests illimités et gratuits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalTestPage;
