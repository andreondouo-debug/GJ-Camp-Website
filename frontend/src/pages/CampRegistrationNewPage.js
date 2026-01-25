import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ModernLogo from '../components/ModernLogo';
import { UserIcon, MailIcon, HomeIcon, CreditCardIcon } from '../components/Icons';
import PayPalButton from '../components/PayPalButton';
import '../styles/RegistrationNew.css';

const CampRegistrationNewPage = () => {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    sex: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    refuge: '',
    hasAllergies: false,
    allergyDetails: '',
    amountPaid: 20,
    paymentMethod: 'paypal' // 'paypal' ou 'cash'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const [formValidated, setFormValidated] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [minAmount, setMinAmount] = useState(20);
  const [maxAmount, setMaxAmount] = useState(120);

  // Charger les montants min/max depuis les paramètres
  useEffect(() => {
    const fetchRegistrationSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        if (response.data.settings) {
          const min = response.data.settings.registrationMinAmount || 20;
          const max = response.data.settings.registrationMaxAmount || 120;
          setMinAmount(min);
          setMaxAmount(max);
          // Mettre à jour le montant initial si nécessaire
          if (form.amountPaid < min) {
            setForm(prev => ({ ...prev, amountPaid: min }));
          }
          console.log(`💰 Montants chargés: Min ${min}€, Max ${max}€`);
        }
      } catch (err) {
        console.error('⚠️ Erreur chargement montants, utilisation des valeurs par défaut:', err);
      }
    };

    fetchRegistrationSettings();
  }, []);

  // Vérifier si l'utilisateur est déjà inscrit
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!token) {
        setCheckingRegistration(false);
        return;
      }

      try {
        const response = await axios.get('/api/registration/mes-inscriptions', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.registrations && response.data.registrations.length > 0) {
          setAlreadyRegistered(true);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'inscription:', err);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkExistingRegistration();
  }, [token]);

  // Mettre à jour le formulaire quand les données utilisateur changent
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email
      }));
    }
  }, [user]);
minAmount || form.amountPaid > maxAmount) {
        setError(`Le montant doit être entre ${minAmount}€ et ${maxAmount}€`
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      if (!token) {
        setError('Vous devez être connecté pour vous inscrire au camp.');
        setLoading(false);
        return;
      }

      // Valider le montant
      if (form.amountPaid < 20 || form.amountPaid > 120) {
        setError('Le montant doit être entre 20€ et 120€');
        setLoading(false);
        return;
      }

      // Si paiement en espèces, enregistrer directement
      if (form.paymentMethod === 'cash') {
        const response = await axios.post('/api/registration/cash', form, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setMessage('✅ Inscription enregistrée ! Votre paiement en espèces est en attente de validation par un responsable.');
        
        // Redirection vers l'accueil avec message de succès
        setTimeout(() => {
          navigate('/', { state: { inscriptionSuccess: true } });
        }, 2000);
        
        setLoading(false);
        return;
      }

      // Si paiement PayPal, afficher le bouton
      setFormValidated(true);
      setShowPayPal(true);
      setMessage('✅ Formulaire validé ! Procédez au paiement via PayPal ci-dessous.');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la validation du formulaire');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (details) => {
    setLoading(true);
    try {
      console.log('💰 Détails paiement PayPal:', details);
      console.log('📦 ID Order:', details.id);
      console.log('👤 Payer:', details.payer);
      
      // Enregistrer l'inscription avec les détails du paiement
      const registrationData = {
        ...form,
        paymentDetails: {
          orderID: details.id,
          payerID: details.payer.payer_id,
          payerEmail: details.payer.email_address,
          status: details.status,
          amountPaid: form.amountPaid
        }
      };

      console.log('📤 Envoi au backend:', registrationData);

      const response = await axios.post('/api/registration', registrationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('🎉 Paiement réussi ! Inscription enregistrée. Redirection...');
      setShowPayPal(false);
      
      // Redirection immédiate vers l'accueil avec message de succès
      setTimeout(() => {
        navigate('/', { state: { inscriptionSuccess: true } });
      }, 1500);
      
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      console.error('❌ Réponse backend:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'inscription';
      const errorDetail = err.response?.data?.error ? ` - Détail: ${err.response.data.error}` : '';
      setError(errorMsg + errorDetail);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (err) => {
    setError('❌ Erreur lors du paiement. Veuillez réessayer.');
    console.error('Erreur PayPal:', err);
  };

  const handlePaymentCancel = () => {
    setMessage('⚠️ Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.');
    setShowPayPal(false);
  };

  if (!user) {
    return (
      <div className="new-registration-container">
        <div className="new-registration-box">
          <div className="new-header">
            <ModernLogo variant={7} size="large" />
            <h1>Inscription Camp GJ</h1>
          </div>
          <p className="new-message">Vous devez être connecté pour vous inscrire.</p>
          <button className="new-btn-login" onClick={() => navigate('/login')}>
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Affichage pendant la vérification
  if (checkingRegistration) {
    return (
      <div className="new-registration-container">
        <div className="new-registration-box">
          <div className="new-header">
            <ModernLogo variant={7} size="large" />
            <h1>Inscription Camp GJ</h1>
          </div>
          <p className="new-message">⏳ Vérification de votre inscription...</p>
        </div>
      </div>
    );
  }

  // Bloquer l'accès si déjà inscrit
  if (alreadyRegistered) {
    return (
      <div className="new-registration-container">
        <div className="new-registration-box">
          <div className="new-header">
            <ModernLogo variant={7} size="large" />
            <h1>Inscription Camp GJ</h1>
          </div>
          <div className="already-registered-message">
            <div className="icon-check">✅</div>
            <h2>Vous êtes déjà inscrit !</h2>
            <p>Vous avez déjà une inscription active pour le Camp GJ 2025.</p>
            <p>Vous pouvez cependant inscrire un invité si vous le souhaitez.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button className="new-btn-primary" onClick={() => navigate('/tableau-de-bord')}>
                Voir mon tableau de bord
              </button>
              <button className="new-btn-secondary" onClick={() => navigate('/inscription-invite')}>
                👥 Inscrire un invité
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="new-registration-container">
      <div className="new-registration-box">
        <div className="new-header">
          <ModernLogo variant={7} size="large" />
          <div className="new-header-text">
            <h1>Camp GJ 2025</h1>
            <p>Formulaire d'inscription</p>
            <div className="camp-date-reminder" title="Date du camp">
              📅 <strong>16-25 août 2025</strong>
            </div>
          </div>
        </div>

        {message && <div className="new-alert new-alert-success">{message}</div>}
        {error && <div className="new-alert new-alert-error">{error}</div>}

        <form className="new-form" onSubmit={handleSubmit}>
          {/* Informations personnelles */}
          <div className="new-section">
            <div className="new-section-header">
              <span className="new-section-icon"><UserIcon size={32} color="#667eea" /></span>
              <h2>Informations personnelles</h2>
            </div>
            
            <div className="new-grid">
              <div className="new-input-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
                  disabled
                  style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              
              <div className="new-input-group">
                <label>Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Votre prénom"
                  disabled
                  style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="new-grid">
              <div className="new-input-group">
                <label>Date de naissance</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="new-input-group">
                <label>Sexe</label>
                <div className="new-radio-group">
                  <label className="new-radio">
                    <input
                      type="radio"
                      name="sex"
                      value="M"
                      checked={form.sex === 'M'}
                      onChange={handleChange}
                      required
                    />
                    <span>Masculin</span>
                  </label>
                  <label className="new-radio">
                    <input
                      type="radio"
                      name="sex"
                      value="F"
                      checked={form.sex === 'F'}
                      onChange={handleChange}
                      required
                    />
                    <span>Féminin</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="new-section">
            <div className="new-section-header">
              <span className="new-section-icon"><MailIcon size={32} color="#667eea" /></span>
              <h2>Coordonnées</h2>
            </div>
            
            <div className="new-input-group">
              <label>Adresse complète</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                placeholder="Rue, ville, code postal"
              />
            </div>

            <div className="new-grid">
              <div className="new-input-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="06 12 34 56 78"
                />
              </div>
              
              <div className="new-input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="votre@email.com"
                  disabled
                  style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
            </div>
          </div>

          {/* Refuge et allergies */}
          <div className="new-section">
            <div className="new-section-header">
              <span className="new-section-icon"><HomeIcon size={32} color="#667eea" /></span>
              <h2>Refuge & Allergies</h2>
            </div>
            
            <div className="new-input-group">
              <label>Mon refuge CRPT</label>
              <select name="refuge" value={form.refuge} onChange={handleChange} required>
                <option value="">-- Sélectionner votre refuge --</option>
                <option value="Lorient">Lorient</option>
                <option value="Laval">Laval</option>
                <option value="Amiens">Amiens</option>
                <option value="Nantes">Nantes</option>
                <option value="Autres">Autres</option>
              </select>
            </div>

            <div className="new-checkbox-group">
              <label className="new-checkbox">
                <input
                  type="checkbox"
                  name="hasAllergies"
                  checked={form.hasAllergies}
                  onChange={handleChange}
                />
                <span>J'ai des allergies alimentaires ou médicales</span>
              </label>
            </div>

            {form.hasAllergies && (
              <div className="new-input-group">
                <label>Précisez vos allergies</label>
                <textarea
                  name="allergyDetails"
                  value={form.allergyDetails}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Décrivez vos allergies en détail..."
                  required={form.hasAllergies}
                />
              </div>
            )}
          </div>

          {/* Paiement */}
          <div className="new-section new-section-payment">
            <div className="new-section-header">
              <span className="new-section-icon"><CreditCardIcon size={32} color="#667eea" /></span>
              <h2>Frais d'inscription</h2>
            </div>
            
            <div className="new-payment-info">
              <div className="new-payment-total">
                <span>Montant total</span>
                <strong>120€</strong>
              </div>
              <p className="new-payment-note">Vous pouvez payer en plusieurs fois</p>
            </div>

            {/* Choix du mode de paiement */}
            <div className="new-input-group">
              <label>Mode de paiement</label>
              <div className="new-payment-method-options">
                <label className="new-payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={form.paymentMethod === 'paypal'}
                    onChange={handleChange}
                  />
                  <div className="method-content">
                    <span className="method-icon">💳</span>
                    <div>
                      <strong>PayPal</strong>
                      <small>Paiement en ligne sécurisé</small>
                    </div>
                  </div>
                </label>
                
                <label className="new-payment-method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={form.paymentMethod === 'cash'}
                    onChange={handleChange}
                  />
                  <div className="method-content">
                    <span className="method-icon">💵</span>
                    <div>
                      <strong>Espèces</strong>
                      <small>Paiement à remettre à un responsable</small>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {form.paymentMethod === 'cash' && (
              <div className="new-cash-instructions">
                <h4>📌 Instructions pour le paiement en espèces :</h4>
                <ol>
                  <li>Indiquez le montant que vous allez remettre ci-dessous</li>
                  <li>Validez le formulaire pour enregistrer votre inscription</li>
                  <li>Remettez le montant en espèces à un responsable</li>
                  <li>Le responsable validera votre paiement dans le système</li>
                  <li>Vous recevrez un email de confirmation et pourrez accéder aux activités</li>
                </ol>
                <p className="new-cash-note">
                  ⚠️ <strong>Important :</strong> Votre inscription sera enregistrée mais en attente de validation 
                  jusqu'à ce qu'un responsable confirme la réception du paiement.
                </p>
              </div>
            )}

            <div className="new-input-group">
              <label>Montant à payer maintenant</label>
              <div className="new-payment-options">
                {[minAmount, 60, 80, maxAmount].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    className={`new-payment-option ${form.amountPaid === amount ? 'active' : ''}`}
                    onClick={() => setForm(prev => ({ ...prev, amountPaid: amount }))}
                  >
                    <span className="amount">{amount}€</span>
                    {amount === minAmount && <span className="label">Minimum</span>}
                    {amount === maxAmount && <span className="label">Total</span>}
                  </button>
                ))}
              </div>
              
              <div className="new-custom-amount">
                <label>Ou saisissez un montant personnalisé</label>
                <div className="new-amount-input-wrapper">
                  <input
                    type="number"
                    name="amountPaid"
                    value={form.amountPaid}
                    onChange={handleChange}
                    min={minAmount}
                    max={maxAmount}
                    step="1"
                    placeholder={`Montant (${minAmount}-${maxAmount}€)`}
                  />
                  <span className="currency">€</span>
                </div>
                <p className="new-hint">Montant minimum : {minAmount}€ • Maximum : {maxAmount}€</p>
              </div>
            </div>

            <div className="new-payment-summary">
              <div className="summary-item">
                <span>Montant payé</span>
                <strong>{form.amountPaid}€</strong>
              </div>
              <div className="summary-item remaining">
                <span>Reste à payer</span>
                <strong>{120 - form.amountPaid}€</strong>
              </div>
            </div>
          </div>

          <button type="submit" className="new-btn-submit" disabled={loading || showPayPal}>
            {loading ? '⏳ Inscription en cours...' : 
             showPayPal ? '✅ Formulaire validé' : 
             form.paymentMethod === 'cash' ? '✅ Enregistrer mon inscription' :
             '✅ Valider mon inscription'}
          </button>

          {showPayPal && form.paymentMethod === 'paypal' && (
            <div className="paypal-section">
              <h3>💳 Paiement sécurisé via PayPal / Carte bancaire</h3>
              <p className="paypal-info">Montant à régler : <strong>{form.amountPaid}€</strong></p>
              <PayPalButton
                amount={form.amountPaid}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CampRegistrationNewPage;
