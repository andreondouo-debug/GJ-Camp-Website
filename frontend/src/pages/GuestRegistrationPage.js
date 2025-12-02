import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ModernLogo from '../components/ModernLogo';
import { UserIcon, MailIcon, HomeIcon, CreditCardIcon } from '../components/Icons';
import PayPalButton from '../components/PayPalButton';
import '../styles/RegistrationNew.css';

const GuestRegistrationPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    sex: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    refuge: '',
    hasAllergies: false,
    allergyDetails: '',
    amountPaid: 20
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const [formValidated, setFormValidated] = useState(false);

  const handleChange = (e) => {
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
        setError('Vous devez être connecté pour inscrire un invité.');
        setLoading(false);
        return;
      }

      // Valider le montant
      if (form.amountPaid < 20 || form.amountPaid > 120) {
        setError('Le montant doit être entre 20€ et 120€');
        setLoading(false);
        return;
      }

      // Valider les allergies
      if (form.hasAllergies && !form.allergyDetails.trim()) {
        setError('Veuillez préciser les allergies de votre invité');
        setLoading(false);
        return;
      }

      // Formulaire validé, afficher PayPal
      setFormValidated(true);
      setShowPayPal(true);
      setLoading(false);
    } catch (err) {
      console.error('Erreur de validation:', err);
      setError('Une erreur est survenue lors de la validation');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (details) => {
    try {
      console.log('💰 Paiement PayPal réussi - Détails complets:', details);
      console.log('📝 Structure details.payer:', details.payer);
      console.log('🔑 Order ID:', details.id);

      const registrationData = {
        ...form,
        paymentDetails: {
          orderID: details.id,
          payerID: details.payer.payer_id,
          payerEmail: details.payer.email_address,
          status: details.status,
          amountPaid: parseFloat(form.amountPaid)
        }
      };

      console.log('📤 Envoi au backend:', registrationData);

      const response = await axios.post('/api/registration/guest', registrationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Inscription invité enregistrée:', response.data);
      setMessage(response.data.message || '✅ Invité inscrit au camp avec succès !');
      setError(null);
      setShowPayPal(false);
      
      setTimeout(() => {
        // Forcer un rechargement complet de la page
        window.location.href = '/tableau-de-bord';
      }, 2000);
    } catch (err) {
      console.error('❌ Erreur lors de l\'inscription invité:', err);
      console.error('❌ Détails erreur:', err.response?.data);
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription de l\'invité');
    }
  };

  const handlePaymentError = (error) => {
    console.error('❌ Erreur de paiement:', error);
    setError('Le paiement a échoué. Veuillez réessayer.');
    setShowPayPal(false);
    setFormValidated(false);
  };

  const handlePaymentCancel = () => {
    setError('⚠️ Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.');
    setShowPayPal(false);
    setFormValidated(false);
  };

  return (
    <div className="new-registration-container">
      <ModernLogo />
      
      <div className="new-header">
        <h1>👥 Inscrire un Invité au Camp</h1>
        <p>Inscrivez un ami ou un membre de votre famille au camp GJ 2025</p>
      </div>

      {message && (
        <div className="new-success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="new-error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="new-form">
        {/* Informations Personnelles */}
        <div className="new-section">
          <div className="new-section-header">
            <UserIcon />
            <h2>Informations Personnelles de l'Invité</h2>
          </div>

          <div className="new-grid">
            <div className="new-input-group">
              <label htmlFor="firstName">Prénom *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                disabled={formValidated}
              />
            </div>

            <div className="new-input-group">
              <label htmlFor="lastName">Nom *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                disabled={formValidated}
              />
            </div>
          </div>

          <div className="new-input-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={formValidated}
            />
          </div>

          <div className="new-grid">
            <div className="new-input-group">
              <label htmlFor="sex">Sexe *</label>
              <select
                id="sex"
                name="sex"
                value={form.sex}
                onChange={handleChange}
                required
                disabled={formValidated}
              >
                <option value="">Sélectionner...</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            <div className="new-input-group">
              <label htmlFor="dateOfBirth">Date de naissance *</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
                disabled={formValidated}
              />
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="new-section">
          <div className="new-section-header">
            <HomeIcon />
            <h2>Coordonnées</h2>
          </div>

          <div className="new-input-group">
            <label htmlFor="address">Adresse Postale *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              disabled={formValidated}
            />
          </div>

          <div className="new-input-group">
            <label htmlFor="phone">Téléphone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              disabled={formValidated}
            />
          </div>

          <div className="new-input-group">
            <label htmlFor="refuge">Refuge CRPT *</label>
            <select
              id="refuge"
              name="refuge"
              value={form.refuge}
              onChange={handleChange}
              required
              disabled={formValidated}
            >
              <option value="">Sélectionner votre refuge...</option>
              <option value="Lorient">Lorient</option>
              <option value="Laval">Laval</option>
              <option value="Amiens">Amiens</option>
              <option value="Nantes">Nantes</option>
              <option value="Autres">Autres</option>
            </select>
          </div>
        </div>

        {/* Informations Médicales */}
        <div className="new-section">
          <div className="new-section-header">
            <MailIcon />
            <h2>Informations Médicales</h2>
          </div>

          <div className="new-checkbox-group">
            <input
              type="checkbox"
              id="hasAllergies"
              name="hasAllergies"
              checked={form.hasAllergies}
              onChange={handleChange}
              disabled={formValidated}
            />
            <label htmlFor="hasAllergies">L'invité a des allergies</label>
          </div>

          {form.hasAllergies && (
            <div className="new-input-group">
              <label htmlFor="allergyDetails">Détails des Allergies *</label>
              <textarea
                id="allergyDetails"
                name="allergyDetails"
                value={form.allergyDetails}
                onChange={handleChange}
                rows="3"
                required={form.hasAllergies}
                disabled={formValidated}
              />
            </div>
          )}
        </div>

        {/* Paiement */}
        <div className="new-section">
          <div className="new-section-header">
            <CreditCardIcon />
            <h2>Paiement</h2>
          </div>

          <div className="new-payment-info">
            <p className="new-price-total">Prix total : <strong>120 €</strong></p>
            <p className="new-payment-note">
              Montant minimum : 20 € • Vous pourrez payer le reste plus tard
            </p>
          </div>

          <div className="new-input-group">
            <label htmlFor="amountPaid">Montant à payer maintenant (€) *</label>
            <input
              type="number"
              id="amountPaid"
              name="amountPaid"
              value={form.amountPaid}
              onChange={handleChange}
              min="20"
              max="120"
              required
              disabled={formValidated}
            />
          </div>

          <div className="new-payment-summary">
            <p>Montant payé : <strong>{form.amountPaid} €</strong></p>
            <p>Reste à payer : <strong>{120 - form.amountPaid} €</strong></p>
          </div>
        </div>

        {!showPayPal && (
          <button type="submit" className="new-btn-submit" disabled={loading}>
            {loading ? 'Validation en cours...' : 'Valider mon inscription'}
          </button>
        )}
      </form>

      {showPayPal && (
        <div className="paypal-section">
          <h3>💳 Finaliser le Paiement avec PayPal</h3>
          <p className="paypal-info">
            Montant à payer : <strong>{form.amountPaid} €</strong>
          </p>
          <div className="paypal-button-container">
            <PayPalButton 
              amount={parseFloat(form.amountPaid)}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestRegistrationPage;
