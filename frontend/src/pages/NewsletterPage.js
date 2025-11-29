import React, { useState } from 'react';
import '../styles/App.css';

function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }
    // Ici, vous pouvez ajouter l'appel API pour enregistrer l'email à la newsletter
    setSuccess('✅ Merci ! Vous êtes inscrit à la newsletter.');
    setEmail('');
  };

  return (
    <div className="newsletter-page" style={{maxWidth: 420, margin: '48px auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #764ba233', padding: '2.5rem 2rem'}}>
      <h1 style={{textAlign: 'center', color: '#764ba2', fontWeight: 800, fontSize: '2rem', marginBottom: 18}}>
        📧 Newsletter
      </h1>
      <p style={{textAlign: 'center', color: '#001a4d', marginBottom: 28}}>
        Restez informé des nouveautés, événements et actualités du camp Génération Josué !
      </p>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 18}}>
        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-newsletter"
          style={{padding: '12px 18px', borderRadius: 8, border: '1.5px solid #764ba2', fontSize: '1.1rem'}}
        />
        <button type="submit" className="btn-newsletter" style={{background: '#764ba2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer'}}>
          S'inscrire
        </button>
      </form>
      {success && <div className="alert alert-success" style={{marginTop: 18, color: '#2ecc71', textAlign: 'center'}}>{success}</div>}
      {error && <div className="alert alert-error" style={{marginTop: 18, color: '#a01e1e', textAlign: 'center'}}>{error}</div>}
    </div>
  );
}

export default NewsletterPage;
