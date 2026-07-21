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
    numberOfDays: 3,
    partialAttendance: false,
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
  const [paymentMode, setPaymentMode] = useState('paypal'); // 'paypal' ou 'revolut'
  const [revolutLink, setRevolutLink] = useState('');
  const [revolutSubmitted, setRevolutSubmitted] = useState(false);

  // Charger les paramètres d'inscription au montage
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        const settings = response.data.settings;
        const min = Number(settings?.registrationMinAmount) || 20;
        const max = Number(settings?.registrationMaxAmount) || 120;
        setMinAmount(min);
        setMaxAmount(max);
        setPaymentMode(settings?.paymentMode || 'paypal');
        setRevolutLink(settings?.revolutLink || '');
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
    } else if (name === 'amountPaid') {
      const numericValue = parseFloat(value) || minAmount;
      setForm(prev => ({ ...prev, [name]: numericValue }));
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
        // 🔒 VALIDATION SERVEUR AVANT PAIEMENT (garantit que l'inscription réussira après paiement)
        try {
          await axios.post('/api/registrations/validate-camp-registration', form, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
        } catch (validationErr) {
          setError(validationErr.response?.data?.message || 'Vos informations sont incomplètes ou invalides. Corrigez avant de payer.');
          setLoading(false);
          return;
        }

        // 🔀 Selon le mode de paiement configuré par l'admin
        if (paymentMode === 'revolut') {
          // Mode Revolut : créer une pré-inscription puis rediriger vers le lien
          await handleRevolutRegistration();
        } else {
          // Mode PayPal : afficher les boutons de paiement
          console.log('✅ Informations validées côté serveur, affichage PayPal');
          setValidatedForm(form);
          setShowPayPal(true);
          setMessage('✅ Informations validées ! Vous pouvez procéder au paiement en toute sécurité.');
          setLoading(false);
        }
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

  // 🔗 Inscription en mode Revolut : pré-inscription + redirection vers le lien de paiement
  const handleRevolutRegistration = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const dataToSend = {
        ...form,
        email: form.email.toLowerCase().trim()
      };
      const response = await axios.post('/api/registrations/revolut-preregistration', dataToSend, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const apiMessage = response.data.message || '✅ Inscription prise en compte !';
      const instructions = response.data.instructions || {};
      const messageParts = [
        apiMessage,
        instructions.important,
        instructions.step1,
        instructions.step2,
        instructions.step3,
        instructions.step4,
        instructions.access
      ].filter(Boolean);
      setMessage(messageParts.join('\n'));
      setRevolutSubmitted(true);

      // Rediriger vers le lien de paiement Revolut (nouvel onglet)
      if (revolutLink && revolutLink.trim() !== '') {
        setTimeout(() => {
          window.open(revolutLink, '_blank', 'noopener,noreferrer');
        }, 1500);
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur pré-inscription Revolut:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
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
      const errData = err.response?.data;
      const msg = errData?.type === 'ValidationError'
        ? `Erreur de validation : ${errData.message}`
        : (errData?.message || errData?.error || 'Erreur lors de l\'inscription');
      setError(msg);
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
      
      // Afficher le message détaillé de l'API avec formatage
      const apiMessage = response.data.message || '🎉 Inscription réussie ! Vous pourrez payer au camp.';
      const instructions = response.data.instructions || {};
      
      let fullMessage = apiMessage;
      if (instructions.important) {
        const messageParts = [
          apiMessage,
          instructions.important,
          instructions.step1,
          instructions.step2,
          instructions.step3,
          instructions.step4,
          instructions.access
        ].filter(Boolean);
        fullMessage = messageParts.join('\n');
      }
      
      setMessage(fullMessage);
      
      // Si compte créé, connecter automatiquement
      if (response.data.token && response.data.user) {
        console.log('🔐 Connexion automatique avec token...');
        await login(response.data.user, response.data.token);
        console.log('✅ Connexion automatique réussie');
      }
      
      // Rediriger vers le tableau de bord (plus de temps pour lire si PreRegistration)
      const redirectDelay = instructions.important ? 15000 : 2000;
      setTimeout(() => {
        navigate('/tableau-de-bord');
      }, redirectDelay);
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

          {message && (
            <div className="alert alert-success" style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
              {message}
            </div>
          )}
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
                  name="partialAttendance"
                  checked={form.partialAttendance}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    partialAttendance: e.target.checked,
                    numberOfDays: e.target.checked ? 1 : 3,
                    amountPaid: minAmount
                  }))}
                />
                <span>Je ne serai là que pour un certain nombre de jours</span>
              </label>
            </div>

            {form.partialAttendance && (
              <div className="form-field">
                <label>Nombre de jours de présence</label>
                <div className="payment-buttons">
                  {[1, 2].map(d => (
                    <button
                      key={d}
                      type="button"
                      className={`payment-btn ${form.numberOfDays === d ? 'active' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, numberOfDays: d, amountPaid: minAmount }))}
                    >
                      <span>{d} jour{d > 1 ? 's' : ''}</span>
                      <small>{d * 40}€</small>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>40€/jour · Total pour {form.numberOfDays} jour{form.numberOfDays > 1 ? 's' : ''} : <strong>{form.numberOfDays * 40}€</strong></p>
              </div>
            )}

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
              <p className="total-price">Total : <strong>{form.numberOfDays * 40}€</strong> ({form.numberOfDays} jour{form.numberOfDays > 1 ? 's' : ''})</p>
            </div>
            
            <div className="form-field">
              <label>Mode de paiement *</label>
              <div className="payment-method-buttons">
                <button
                  type="button"
                  className={`payment-method-btn ${form.paymentMethod === 'paypal' ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'paypal' }))}
                >
                  💳 {paymentMode === 'revolut' ? 'Payer par carte' : 'Carte bancaire'}
                </button>
                <button
                  type="button"
                  className={`payment-method-btn ${form.paymentMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'cash' }))}
                >
                  💵 Espèces (payer au camp)
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
                {paymentMode === 'revolut'
                  ? '💳 Paiement sécurisé par carte. Après validation du formulaire, vous serez redirigé vers la page de paiement. Votre inscription sera confirmée après vérification du paiement par un responsable.'
                  : '💳 Paiement par carte bancaire — aucun compte PayPal requis. Vous avez un compte PayPal ? Vous pouvez aussi l\'utiliser lors du paiement.'}
              </p>
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
                <label htmlFor="customAmount">Ou entrez un montant personnalisé ({minAmount}-{form.numberOfDays * 40}€) :</label>
                <input
                  type="number"
                  id="customAmount"
                  name="amountPaid"
                  value={form.amountPaid}
                  onChange={handleChange}
                  min={minAmount}
                  max={form.numberOfDays * 40}
                  step="1"
                  placeholder={`Ex: ${form.numberOfDays * 40}`}
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
                <strong>{Math.max(0, form.numberOfDays * 40 - form.amountPaid)}€</strong>
              </div>
            </div>
          </div>

          {!showPayPal && !revolutSubmitted && (
            <div className="form-actions">
              <button type="submit" className="btn-primary btn-large" disabled={loading}>
                <span>{loading ? '⏳ Validation en cours...' : '✅ Valider mon inscription'}</span>
              </button>
            </div>
          )}
        </form>

        {/* Mode Revolut : après soumission, bouton pour (re)payer via le lien */}
        {revolutSubmitted && revolutLink && (
          <div className="paypal-section" style={{ textAlign: 'center' }}>
            <h3>🔗 Finaliser votre paiement</h3>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '12px' }}>
              Cliquez ci-dessous pour effectuer votre paiement de <strong>{form.amountPaid}€</strong>.
              Votre inscription sera confirmée après vérification par un responsable.
            </p>
            <a
              href={revolutLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-large"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              💳 Payer {form.amountPaid}€ maintenant
            </a>
          </div>
        )}

        {showPayPal && (
          <div className="paypal-section">
            <h3>💳 Paiement sécurisé par carte bancaire</h3>
            <p className="paypal-info">
              Montant à régler : <strong>{validatedForm?.amountPaid || 20}€</strong>
            </p>
            <p className="paypal-hint" style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
              Saisissez simplement votre numéro de carte. <strong>Aucun compte PayPal nécessaire.</strong><br/>
              Si vous avez un compte PayPal, vous pouvez aussi l'utiliser.
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
