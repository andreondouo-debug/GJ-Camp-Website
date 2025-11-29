
import React, { useState } from 'react';
import '../styles/App.css';


function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Blocs dynamiques (texte, image, vidéo, lien)
  const [blocks, setBlocks] = useState([
    { type: 'text', value: 'Bienvenue sur la newsletter Génération Josué !' },
  ]);

  const handleAddBlock = (type) => {
    let value = '';
    if (type === 'text') value = 'Nouveau message...';
    if (type === 'image') value = 'https://';
    if (type === 'video') value = 'https://www.youtube.com/embed/';
    if (type === 'link') value = 'https://';
    setBlocks([...blocks, { type, value }]);
  };
  const handleBlockChange = (idx, newValue) => {
    setBlocks(blocks.map((b, i) => i === idx ? { ...b, value: newValue } : b));
  };
  const handleRemoveBlock = (idx) => {
    setBlocks(blocks.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }
    setSuccess('✅ Merci ! Vous êtes inscrit à la newsletter.');
    setEmail('');
  };

  return (
    <div className="newsletter-page" style={{maxWidth: 800, margin: '48px auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #764ba233', padding: '2.5rem 2rem'}}>
      <h1 style={{textAlign: 'center', color: '#764ba2', fontWeight: 800, fontSize: '2.3rem', marginBottom: 18, letterSpacing: '0.01em'}}>
        Newsletter
      </h1>
      <div style={{marginBottom: 32}}>
        {blocks.map((block, idx) => (
          <div key={idx} style={{marginBottom: 18, position: 'relative', background: '#f9f7fd', borderRadius: 10, padding: 14}}>
            <button onClick={() => handleRemoveBlock(idx)} style={{position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#a01e1e', fontWeight: 700, fontSize: 18, cursor: 'pointer'}} title="Supprimer">×</button>
            {block.type === 'text' && (
              <textarea value={block.value} onChange={e => handleBlockChange(idx, e.target.value)} style={{width: '100%', minHeight: 48, border: '1px solid #764ba2', borderRadius: 6, padding: 8, fontSize: '1.08rem', color: '#001a4d', background: '#fff'}} />
            )}
            {block.type === 'image' && (
              <div>
                <input type="text" value={block.value} onChange={e => handleBlockChange(idx, e.target.value)} placeholder="URL de l'image" style={{width: '100%', marginBottom: 8, border: '1px solid #764ba2', borderRadius: 6, padding: 8}} />
                <img src={block.value} alt="Newsletter visuel" style={{maxWidth: '100%', borderRadius: 8, marginTop: 4}} />
              </div>
            )}
            {block.type === 'video' && (
              <div>
                <input type="text" value={block.value} onChange={e => handleBlockChange(idx, e.target.value)} placeholder="URL YouTube embed" style={{width: '100%', marginBottom: 8, border: '1px solid #764ba2', borderRadius: 6, padding: 8}} />
                <iframe width="100%" height="220" style={{borderRadius: 8}} src={block.value} title="Vidéo newsletter" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
            )}
            {block.type === 'link' && (
              <div>
                <input type="text" value={block.value} onChange={e => handleBlockChange(idx, e.target.value)} placeholder="URL du lien" style={{width: '100%', marginBottom: 8, border: '1px solid #764ba2', borderRadius: 6, padding: 8}} />
                <a href={block.value} target="_blank" rel="noopener noreferrer" style={{color: '#764ba2', fontWeight: 600, textDecoration: 'underline'}}>Voir le lien</a>
              </div>
            )}
          </div>
        ))}
        <div style={{display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12}}>
          <button onClick={() => handleAddBlock('text')} style={{background: '#764ba2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer'}}>Ajouter texte</button>
          <button onClick={() => handleAddBlock('image')} style={{background: '#d4af37', color: '#001a4d', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer'}}>Ajouter image</button>
          <button onClick={() => handleAddBlock('video')} style={{background: '#a01e1e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer'}}>Ajouter vidéo</button>
          <button onClick={() => handleAddBlock('link')} style={{background: '#001a4d', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer'}}>Ajouter lien</button>
        </div>
      </div>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 400, margin: '0 auto'}}>
        <input
          type="email"
          placeholder="Votre email pour recevoir la newsletter"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-newsletter"
          style={{padding: '12px 18px', borderRadius: 8, border: '1.5px solid #764ba2', fontSize: '1.1rem'}}
        />
        <button type="submit" className="btn-newsletter" style={{background: '#764ba2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer'}}>
          S'inscrire à la newsletter
        </button>
      </form>
      {success && <div className="alert alert-success" style={{marginTop: 18, color: '#2ecc71', textAlign: 'center'}}>{success}</div>}
      {error && <div className="alert alert-error" style={{marginTop: 18, color: '#a01e1e', textAlign: 'center'}}>{error}</div>}
    </div>
  );
}

export default NewsletterPage;
