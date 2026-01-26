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
    
    // 🔄 RÉINITIALISER l'état avant tout changement
    setSdkReady(false);
    buttonRendered.current = false;
    setError(null);
    
    // Utiliser le bon Client ID selon le mode
    const clientId = paypalMode === 'live' 
      ? process.env.REACT_APP_PAYPAL_LIVE_CLIENT_ID
      : process.env.REACT_APP_PAYPAL_SANDBOX_CLIENT_ID;
    
    if (!clientId) {
      setError('Client ID PayPal non configuré');
      return;
    }

    // 🚨 NETTOYAGE COMPLET : Supprimer TOUS les scripts PayPal existants
    const existingScripts = document.querySelectorAll('script[src*="paypal.com"]');
    if (existingScripts.length > 0) {
      console.log(`🔄 Suppression de ${existingScripts.length} script(s) PayPal existant(s)`);
      existingScripts.forEach(script => script.remove());
    }
    
    // Supprimer l'objet global PayPal
    if (window.paypal) {
      console.log('🗑️ Nettoyage objet window.paypal');
      delete window.paypal;
    }

    // ⏳ ATTENDRE un peu pour que le navigateur nettoie complètement
    const loadDelay = setTimeout(() => {
      console.log(`📥 Chargement SDK PayPal en mode ${paypalMode.toUpperCase()}...`);
      console.log(`🔑 Client ID utilisé: ${clientId.substring(0, 20)}...`);
      
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
      script.async = true;
      script.setAttribute('data-namespace', 'paypal'); // Forcer un namespace propre
      
      script.onload = () => {
        console.log(`✅ SDK PayPal chargé en mode ${paypalMode.toUpperCase()}`);
        setSdkReady(true);
      };
      
      script.onerror = () => {
        console.error('❌ Erreur de chargement du SDK PayPal');
        setError('Erreur de chargement PayPal');
        setSdkReady(false);
      };
      
      document.body.appendChild(script);
    }, 100); // Délai de 100ms pour le nettoyage
    
    // Cleanup function
    return () => {
      clearTimeout(loadDelay);
    };
  }, [paypalMode]);

  // Rendre les boutons PayPal quand le SDK est prêt
  useEffect(() => {
    if (!sdkReady || !paypalRef.current || buttonRendered.current) {
      return;
    }

    // ✅ VÉRIFICATION CRITIQUE : S'assurer que window.paypal.Buttons existe
    if (!window.paypal || typeof window.paypal.Buttons !== 'function') {
      console.error('❌ window.paypal.Buttons n\'est pas disponible');
      setError('SDK PayPal non initialisé correctement');
      setSdkReady(false); // Forcer un rechargement
      return;
    }

    // 🔄 Nettoyer le conteneur avant de rendre les nouveaux boutons
    if (paypalRef.current) {
      paypalRef.current.innerHTML = '';
    }

    console.log(`🎨 Rendu des boutons PayPal en mode ${paypalMode.toUpperCase()} pour`, amount, '€');

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
          padding: '15px',
          marginBottom: '15px',
          borderRadius: '8px',
          background: paypalMode === 'sandbox' ? '#e0f2fe' : '#fee2e2',
          border: `3px solid ${paypalMode === 'sandbox' ? '#0284c7' : '#dc2626'}`,
          fontSize: '16px',
          fontWeight: 'bold',
          color: paypalMode === 'sandbox' ? '#0369a1' : '#991b1b'
        }}>
          {paypalMode === 'sandbox' ? (
            <>🧪 Mode TEST (Sandbox) - Aucun argent réel ne sera débité</>
          ) : (
            <>🔴 MODE PRODUCTION (Live) - PAIEMENTS RÉELS EN COURS</>
          )}
        </div>
      )}
      
      {/* 🚨 AVERTISSEMENT CRITIQUE EN MODE LIVE */}
      {paypalMode === 'live' && (
        <div style={{
          padding: '15px',
          marginBottom: '15px',
          borderRadius: '8px',
          background: '#fef3c7',
          border: '3px solid #f59e0b',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#92400e'
        }}>
          ⚠️ <strong>ATTENTION :</strong> Ce paiement sera débité de votre compte bancaire réel.
          <br />Ne PAS utiliser de compte test Sandbox !
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
          ⏳ Chargement de PayPal en mode {paypalMode?.toUpperCase()}...
        </div>
      )}
      
      <div ref={paypalRef}></div>
    </div>
  );
};

export default PayPalButton;
