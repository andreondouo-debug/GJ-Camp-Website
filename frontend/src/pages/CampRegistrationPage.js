import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ModernLogo from '../components/ModernLogo';
import PayPalButton from '../components/PayPalButton';
import DateInput from '../components/DateInput';
import './CampRegistrationPage.css';

const CampRegistrationPage = () => {
  const { token, user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '', // Nouveau: mot de passe pour créer compte
    confirmPassword: '', // Nouveau: confirmation mot de passe
    sex: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    refuge: '',
    hasAllergies: false,
    allergyDetails: '',
    paymentMethod: 'paypal', // Mode de paiement par défaut
    amountPaid: 20
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const [validatedForm, setValidatedForm] = useState(null);
  const [minAmount, setMinAmount] = useState(20);
  const [maxAmount, setMaxAmount] = useState(120);

  // Charger les paramètres d'inscription au montage
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        const settings = response.data.settings;
        const min = settings?.registrationMinAmount || 20;
        const max = settings?.registrationMaxAmount || 120;
        setMinAmount(min);
        setMaxAmount(max);
        // Mettre à jour le montant par défaut si nécessaire
        setForm(prev => ({ ...prev, amountPaid: min }));
      } catch (err) {
        console.error('⚠️ Erreur chargement paramètres:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validatePasswordStrength = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('au moins 8 caractères');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('une lettre majuscule');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('une lettre minuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('un chiffre');
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) {
      errors.push('un caractère spécial (!@#$%&*...)');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Validation mot de passe (seulement si pas déjà connecté)
      if (!user) {
        // Validation de force du mot de passe
        const passwordErrors = validatePasswordStrength(form.password);
        if (passwordErrors.length > 0) {
          setError(`🔒 Mot de passe trop faible ! Il doit contenir : ${passwordErrors.join(', ')}.`);
          setLoading(false);
          return;
        }
        
        if (form.password !== form.confirmPassword) {
          setError('❌ Les mots de passe ne correspondent pas.');
          setLoading(false);
          return;
        }
      }

      // ✅ Formulaire validé
      if (form.paymentMethod === 'paypal') {
        // Afficher PayPal pour paiement en ligne
        console.log('✅ Formulaire validé, affichage PayPal');
        setValidatedForm(form);
        setShowPayPal(true);
        setMessage('✅ Formulaire validé ! Procédez au paiement ci-dessous.');
        setLoading(false);
      } else {
        // Paiement espèces : envoyer directement sans PayPal
        console.log('✅ Formulaire validé, inscription espèces');
        await handleCashRegistration();
      }
    } catch (err) {
      console.error('❌ Erreur validation:', err);
      setError(err.response?.data?.message || 'Erreur lors de la validation');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    console.log('✅ Paiement réussi, envoi inscription:', paymentDetails);
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const dataToSend = {
        ...validatedForm,
        paymentDetails: {
          orderID: paymentDetails.id,
          payerID: paymentDetails.payer?.payer_id,
          paymentID: paymentDetails.id
        }
      };

      const response = await axios.post('/api/registrations/camp-with-account', dataToSend, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      console.log('✅ Inscription créée:', response.data);
      setMessage(response.data.message || '🎉 Inscription réussie !');
      
      // Si compte créé, connecter automatiquement
      if (response.data.token && response.data.user) {
        await login(response.data.user, response.data.token);
      }
      
      // Rediriger vers le tableau de bord après 2 secondes
      setTimeout(() => {
        navigate('/tableau-de-bord');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Erreur inscription:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
      setLoading(false);
    }
  };

  const handlePaymentError = (err) => {
    console.error('❌ Erreur paiement PayPal:', err);
    setError('❌ Erreur lors du paiement. Veuillez réessayer.');
    setShowPayPal(false);
    setValidatedForm(null);
  };

  const handlePaymentCancel = () => {
    console.log('⚠️ Paiement annulé par l\'utilisateur');
    setMessage('⚠️ Paiement annulé. Vous pouvez modifier votre inscription et réessayer.');
    setShowPayPal(false);
    setValidatedForm(null);
  };

  const handleCashRegistration = async () => {
    console.log('💵 Inscription avec paiement espèces');
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const dataToSend = {
        ...form,
        email: form.email.toLowerCase().trim(), // Normaliser email
        paymentMethod: 'cash',
        paymentDetails: null // Pas de détails PayPal pour paiement espèces
      };

      console.log('📤 Envoi données inscription espèces:', {
        firstName: dataToSend.firstName,
        lastName: dataToSend.lastName,
        email: dataToSend.email,
        paymentMethod: dataToSend.paymentMethod,
        amountPaid: dataToSend.amountPaid
      });

      const response = await axios.post('/api/registrations/camp-with-account', dataToSend, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      console.log('✅ Inscription espèces créée:', response.data);
      setMessage(response.data.message || '🎉 Inscription réussie ! Vous pourrez payer au camp.');
      
      // Si compte créé, connecter automatiquement
      if (response.data.token && response.data.user) {
        console.log('🔐 Connexion automatique avec token...');
        await login(response.data.user, response.data.token);
        console.log('✅ Connexion automatique réussie');
      }
      
      // Rediriger vers le tableau de bord après 2 secondes
      setTimeout(() => {
        navigate('/tableau-de-bord');
      }, 2000);
    } catch (err) {
      console.error('❌ Erreur inscription espèces:', err);
      console.error('❌ Détails erreur:', err.response?.data);
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
      setLoading(false);
    }
  };

  return (
    <div className="registration-page-wrapper">
      <div className="registration-page">
        <div className="registration-card">
        <div className="registration-card-inner">
          <div className="form-header">
            <ModernLogo variant={7} size="large" />
            <div className="form-header-text">
              <h1 className="form-title">Inscription</h1>
              <h2 className="form-subtitle-main">Camp GJ</h2>
            </div>
          </div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

        <form className="camp-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="section-title">Informations Personnelles</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Nom *</label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>Prénom *</label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <DateInput 
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  name="dateOfBirth"
                  label="Date de naissance"
                  required
                />
              </div>
              <div className="form-field">
                <label>Sexe *</label>
                <div className="radio-group-inline">
                  <label className="radio-label">
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
                  <label className="radio-label">
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

          <div className="form-section">
            <h3 className="section-title">Coordonnées</h3>
            
            <div className="form-field">
              <label>Adresse *</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Rue, ville, code postal"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  required
                />
              </div>
              <div className="form-field">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {!user && (
            <div className="form-section">
              <h3 className="section-title">🔐 Créer votre compte</h3>
              <p className="form-subtitle" style={{marginBottom: '1rem', color: '#666'}}>
                Un compte sera créé automatiquement après validation du paiement
              </p>
              
              <div className="form-row">
                <div className="form-field">
                  <label>Mot de passe *</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required={!user}
                    minLength="8"
                  />
                  <small className="password-requirements">
                    🔒 <strong>Mot de passe fort requis :</strong><br/>
                    • Minimum 8 caractères<br/>
                    • 1 majuscule (A-Z)<br/>
                    • 1 minuscule (a-z)<br/>
                    • 1 chiffre (0-9)<br/>
                    • 1 caractère spécial (!@#$%&*...)
                  </small>
                </div>
                <div className="form-field">
                  <label>Confirmer le mot de passe *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required={!user}
                    minLength="6"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <h3 className="section-title">Refuge & Allergies</h3>
            
            <div className="form-field">
              <label>Mon refuge CRPT *</label>
              <select name="refuge" value={form.refuge} onChange={handleChange} required>
                <option value="">-- Sélectionner --</option>
                <option value="Lorient">Lorient</option>
                <option value="Laval">Laval</option>
                <option value="Amiens">Amiens</option>
                <option value="Nantes">Nantes</option>
                <option value="Autres">Autres</option>
              </select>
            </div>

            <div className="form-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="hasAllergies"
                  checked={form.hasAllergies}
                  onChange={handleChange}
                />
                <span>Avez-vous des allergies ?</span>
              </label>
            </div>

            {form.hasAllergies && (
              <div className="form-field">
                <label>Précisez vos allergies *</label>
                <textarea
                  name="allergyDetails"
                  value={form.allergyDetails}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Décrivez vos allergies..."
                  required={form.hasAllergies}
                />
              </div>
            )}
          </div>

          <div className="form-section payment-section">
            <h3 className="section-title">Frais d'inscription</h3>
            <div className="payment-info">
              <p className="total-price">Total : <strong>{maxAmount}€</strong></p>
            </div>
            
            <div className="form-field">
              <label>Mode de paiement *</label>
              <div className="payment-method-buttons">
                <button
                  type="button"
                  className={`payment-method-btn ${form.paymentMethod === 'paypal' ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'paypal' }))}
                >
                  💳 PayPal / Carte bancaire
                </button>
                <button
                  type="button"
                  className={`payment-method-btn ${form.paymentMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'cash' }))}
                >
                  💵 Espèces (payer au camp)
                </button>
              </div>
            </div>
            
            <div className="form-field">
              <label>Montant à payer maintenant *</label>
              <div className="payment-buttons">
                <button
                  type="button"
                  className={`payment-btn ${form.amountPaid === minAmount ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, amountPaid: minAmount }))}
                >
                  <span>{minAmount}€</span>
                </button>
                <button
                  type="button"
                  className={`payment-btn ${form.amountPaid === Math.floor(maxAmount / 2) ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, amountPaid: Math.floor(maxAmount / 2) }))}
                >
                  <span>{Math.floor(maxAmount / 2)}€</span>
                </button>
                <button
                  type="button"
                  className={`payment-btn ${form.amountPaid === Math.floor(maxAmount * 0.67) ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, amountPaid: Math.floor(maxAmount * 0.67) }))}
                >
                  <span>{Math.floor(maxAmount * 0.67)}€</span>
                </button>
                <button
                  type="button"
                  className={`payment-btn ${form.amountPaid === maxAmount ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, amountPaid: maxAmount }))}
                >
                  <span>{maxAmount}€ (Total)</span>
                </button>
              </div>
              
              <div className="custom-amount-field">
                <label htmlFor="customAmount">Ou entrez un montant personnalisé ({minAmount}-{maxAmount}€) :</label>
                <input
                  type="number"
                  id="customAmount"
                  name="amountPaid"
                  value={form.amountPaid}
                  onChange={handleChange}
                  min={minAmount}
                  max={maxAmount}
                  step="1"
                  placeholder={`Ex: ${Math.floor((minAmount + maxAmount) / 2)}`}
                />
              </div>
            </div>

            <div className="payment-summary">
              <div className="summary-row">
                <span>Montant sélectionné :</span>
                <strong>{form.amountPaid}€</strong>
              </div>
              <div className="summary-row remaining">
                <span>Reste à payer :</span>
                <strong>{maxAmount - form.amountPaid}€</strong>
              </div>
            </div>
          </div>

          {!showPayPal && (
            <div className="form-actions">
              <button type="submit" className="btn-primary btn-large" disabled={loading}>
                <span>{loading ? '⏳ Validation en cours...' : '✅ Valider mon inscription'}</span>
              </button>
            </div>
          )}
        </form>

        {showPayPal && (
          <div className="paypal-section">
            <h3>💳 Finaliser le Paiement</h3>
            <p className="paypal-info">
              Montant à régler : <strong>{validatedForm?.amountPaid || 20}€</strong>
            </p>
            <p className="paypal-hint">
              Vous pouvez payer avec votre compte PayPal ou par carte bancaire.
            </p>
            <div className="paypal-button-container">
              <PayPalButton
                amount={parseFloat(validatedForm?.amountPaid || 20)}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default CampRegistrationPage;
