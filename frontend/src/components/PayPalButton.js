import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_URL = getApiUrl();

const PayPalButton = ({ amount, onSuccess, onError, onCancel }) => {
  const paypalRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState(null);
  const [paypalMode, setPaypalMode] = useState('sandbox');
  const buttonRendered = useRef(false);

  // Charger le mode PayPal depuis les settings
  useEffect(() => {
    const fetchPayPalMode = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/settings`);
        const mode = response.data.settings?.paypalMode || 'sandbox';
        setPaypalMode(mode);
        console.log(`💳 Mode PayPal : ${mode.toUpperCase()}`);
      } catch (err) {
        console.error('❌ Erreur chargement mode PayPal, utilisation sandbox par défaut:', err);
        setPaypalMode('sandbox');
      }
    };
    fetchPayPalMode();
  }, []);

  // Charger le SDK PayPal une seule fois
  useEffect(() => {
    if (!paypalMode) return; // Attendre que le mode soit chargé
    
    // Utiliser le bon Client ID selon le mode
    const clientId = paypalMode === 'live' 
      ? process.env.REACT_APP_PAYPAL_LIVE_CLIENT_ID
      : process.env.REACT_APP_PAYPAL_SANDBOX_CLIENT_ID;
    
    if (!clientId) {
      setError('Client ID PayPal non configuré');
      return;
    }

    // Si le SDK est déjà chargé
    if (window.paypal) {
      console.log('✅ SDK PayPal déjà disponible');
      setSdkReady(true);
      return;
    }

    // Charger le SDK
    console.log('📥 Chargement du SDK PayPal...');
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ SDK PayPal chargé');
      setSdkReady(true);
    };
    
    script.onerror = () => {
      console.error('❌ Erreur de chargement du SDK PayPal');
      setError('Erreur de chargement PayPal');
    };
    
    document.body.appendChild(script);
  }, [paypalMode]);

  // Rendre les boutons PayPal quand le SDK est prêt
  useEffect(() => {
    if (!sdkReady || !paypalRef.current || buttonRendered.current) {
      return;
    }

    console.log('🎨 Rendu des boutons PayPal pour', amount, '€');

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      },
      createOrder: (data, actions) => {
        // Convertir le montant en nombre pour éviter l'erreur "toFixed is not a function"
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          console.error('❌ Montant invalide:', amount);
          throw new Error('Montant invalide');
        }
        
        return actions.order.create({
          purchase_units: [{
            amount: {
              currency_code: 'EUR',
              value: numericAmount.toFixed(2)
            },
            description: `Inscription Camp GJ 2025 - ${numericAmount}€`
          }]
        });
      },
      onApprove: async (data, actions) => {
        try {
          const details = await actions.order.capture();
          console.log('✅ Paiement réussi:', details);
          if (onSuccess) onSuccess(details);
        } catch (err) {
          console.error('❌ Erreur capture:', err);
          if (onError) onError(err);
        }
      },
      onError: (err) => {
        console.error('❌ Erreur PayPal:', err);
        if (onError) onError(err);
      },
      onCancel: (data) => {
        console.log('⚠️ Paiement annulé');
        if (onCancel) onCancel(data);
      }
    }).render(paypalRef.current)
      .then(() => {
        console.log('✅ Boutons rendus');
        buttonRendered.current = true;
      })
      .catch(err => {
        console.error('❌ Erreur rendu:', err);
        setError('Erreur lors du rendu des boutons');
      });
  }, [sdkReady, amount, onSuccess, onError, onCancel]);

  return (
    <div>
      {paypalMode && (
        <div style={{
          textAlign: 'center',
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '8px',
          background: paypalMode === 'sandbox' ? '#e0f2fe' : '#fee2e2',
          border: `2px solid ${paypalMode === 'sandbox' ? '#0284c7' : '#dc2626'}`,
          fontSize: '14px',
          fontWeight: 'bold',
          color: paypalMode === 'sandbox' ? '#0369a1' : '#991b1b'
        }}>
          {paypalMode === 'sandbox' ? '🧪 Mode TEST (Sandbox)' : '🔴 Mode PRODUCTION (Live)'}
        </div>
      )}
      
      {error && (
        <div style={{
          padding: '1rem',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c00',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {!sdkReady && !error && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#667eea'
        }}>
          ⏳ Chargement de PayPal...
        </div>
      )}
      
      <div ref={paypalRef}></div>
    </div>
  );
};

export default PayPalButton;
