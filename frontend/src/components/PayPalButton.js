import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_URL = getApiUrl();

// 🌍 ÉTAT GLOBAL : Un seul script PayPal pour toute l'app
let paypalScriptLoading = false;
let paypalScriptLoaded = false;
let paypalCurrentMode = null;

const PayPalButton = ({ amount, onSuccess, onError, onCancel }) => {
  const paypalRef = useRef(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState(null);
  const [paypalMode, setPaypalMode] = useState(null);
  const buttonRendered = useRef(false);
  const checkInterval = useRef(null);

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

  // Charger le SDK PayPal une seule fois GLOBALEMENT
  useEffect(() => {
    if (!paypalMode) return; // Attendre que le mode soit chargé
    
    // Si le script est déjà chargé avec le même mode, on l'utilise
    if (paypalScriptLoaded && paypalCurrentMode === paypalMode && window.paypal?.Buttons) {
      console.log(`✅ SDK PayPal déjà chargé en mode ${paypalMode.toUpperCase()}`);
      setSdkReady(true);
      return;
    }

    // Si le mode a changé, on doit recharger
    if (paypalScriptLoaded && paypalCurrentMode !== paypalMode) {
      console.log(`🔄 Changement de mode: ${paypalCurrentMode} → ${paypalMode}, rechargement requis...`);
      paypalScriptLoaded = false;
      paypalScriptLoading = false;
      paypalCurrentMode = null;
      
      // Nettoyer les anciens scripts
      const existingScripts = document.querySelectorAll('script[src*="paypal.com"]');
      existingScripts.forEach(script => script.remove());
      if (window.paypal) delete window.paypal;
    }

    // Si le script est en cours de chargement, attendre
    if (paypalScriptLoading) {
      console.log('⏳ Script PayPal déjà en cours de chargement, attente...');
      const waitInterval = setInterval(() => {
        if (paypalScriptLoaded && window.paypal?.Buttons) {
          console.log('✅ Script chargé, prêt à l\'utiliser');
          setSdkReady(true);
          clearInterval(waitInterval);
        }
      }, 100);
      
      return () => clearInterval(waitInterval);
    }

    // Charger le script pour la première fois
    paypalScriptLoading = true;
    buttonRendered.current = false;
    setError(null);
    
    const clientId = paypalMode === 'live' 
      ? process.env.REACT_APP_PAYPAL_LIVE_CLIENT_ID
      : process.env.REACT_APP_PAYPAL_SANDBOX_CLIENT_ID;
    
    if (!clientId) {
      setError('Client ID PayPal non configuré');
      paypalScriptLoading = false;
      return;
    }

    console.log(`📥 Chargement SDK PayPal en mode ${paypalMode.toUpperCase()}...`);
    console.log(`🔑 Client ID: ${clientId.substring(0, 20)}...`);
    
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
    script.async = true;
    script.id = 'paypal-sdk-script'; // ID unique pour éviter les doublons
    
    script.onload = () => {
      console.log(`✅ SDK PayPal chargé en mode ${paypalMode.toUpperCase()}`);
      paypalScriptLoaded = true;
      paypalScriptLoading = false;
      paypalCurrentMode = paypalMode;
      
      // Attendre que window.paypal.Buttons soit vraiment disponible
      const checkReady = setInterval(() => {
        if (window.paypal?.Buttons) {
          console.log('✅ window.paypal.Buttons disponible');
          setSdkReady(true);
          clearInterval(checkReady);
        }
      }, 50);
      
      // Timeout de sécurité
      setTimeout(() => {
        clearInterval(checkReady);
        if (!window.paypal?.Buttons) {
          console.error('⏱️ Timeout: window.paypal.Buttons non disponible');
          setError('SDK PayPal non initialisé correctement');
          paypalScriptLoaded = false;
          paypalScriptLoading = false;
        }
      }, 3000);
    };
    
    script.onerror = () => {
      console.error('❌ Erreur de chargement du SDK PayPal');
      setError('Erreur de chargement PayPal');
      paypalScriptLoaded = false;
      paypalScriptLoading = false;
      setSdkReady(false);
    };
    
    document.body.appendChild(script);
  }, [paypalMode]);

  // Rendre les boutons PayPal quand le SDK est prêt
  useEffect(() => {
    if (!sdkReady || !paypalRef.current || buttonRendered.current) {
      return;
    }

    // ✅ VÉRIFICATION CRITIQUE : S'assurer que window.paypal.Buttons existe
    if (!window.paypal || typeof window.paypal.Buttons !== 'function') {
      console.error('❌ window.paypal.Buttons n\'est pas disponible');
      
      // Réessayer après un délai
      checkInterval.current = setInterval(() => {
        if (window.paypal?.Buttons) {
          console.log('✅ window.paypal.Buttons maintenant disponible');
          setSdkReady(true); // Forcer un re-render
          clearInterval(checkInterval.current);
        }
      }, 100);
      
      // Timeout après 5 secondes
      setTimeout(() => {
        if (checkInterval.current) {
          clearInterval(checkInterval.current);
          setError('SDK PayPal non initialisé correctement');
        }
      }, 5000);
      
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
    
    // Cleanup
    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [sdkReady, amount, onSuccess, onError, onCancel, paypalMode]);

  return (
    <div>
      {/* Badge mode sandbox uniquement */}
      {paypalMode === 'sandbox' && (
        <div style={{
          textAlign: 'center',
          padding: '15px',
          marginBottom: '15px',
          borderRadius: '8px',
          background: '#e0f2fe',
          border: '3px solid #0284c7',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#0369a1'
        }}>
          🧪 Mode TEST (Sandbox) - Aucun argent réel ne sera débité
        </div>
      )}
      
      {/* Pas d'avertissement en mode live - retiré pour ne pas inquiéter les utilisateurs */}
      {false && paypalMode === 'live' && (
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
