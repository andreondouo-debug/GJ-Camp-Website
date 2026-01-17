import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import '../styles/CRPTSettingsPage.css';

const crptDefaults = require('../config/crptPageDefaults');

const CRPTSettingsPage = () => {
  const { token } = useContext(AuthContext);
  const [settings, setSettings] = useState(crptDefaults);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/settings/crpt'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.crptSettings) {
        setSettings(response.data.crptSettings);
      }
    } catch (error) {
      console.log('📝 Utilisation des paramètres par défaut CRPT');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(
        getApiUrl('/api/settings/crpt'),
        { crptSettings: settings },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: '✅ Paramètres CRPT sauvegardés avec succès !' });
      
      // Masquer le message après 3 secondes
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      setMessage({ type: 'error', text: '❌ Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    setSettings(prev => {
      const newArray = [...prev[section].items];
      newArray[index] = { ...newArray[index], [field]: value };
      return {
        ...prev,
        [section]: { ...prev[section], items: newArray }
      };
    });
  };

  const addItem = (section) => {
    const defaultItem = section === 'values' 
      ? { icon: '⭐', title: 'Nouvelle valeur', description: 'Description...', iconColor: '#a01e1e' }
      : { 
          name: 'Nouvelle ville', 
          region: 'Région', 
          description: 'Description...', 
          icon: '🏛️', 
          iconColor: '#a01e1e',
          address: '',
          leaderPhoto: '',
          leaderName: '',
          phone: '',
          email: ''
        };
    
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: [...prev[section].items, defaultItem]
      }
    }));
  };

  const removeItem = (section, index) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: prev[section].items.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="crpt-settings-container">
      <div className="crpt-settings-header">
        <h1>⚙️ Paramètres Page GJ CRPT</h1>
        <p>Personnalisez tous les éléments de la page Christ Refuge Pour Tous</p>
      </div>

      {message.text && (
        <div className={`crpt-settings-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="crpt-settings-tabs">
        <button 
          className={activeSection === 'hero' ? 'active' : ''}
          onClick={() => setActiveSection('hero')}
        >
          🎯 Hero
        </button>
        <button 
          className={activeSection === 'mission' ? 'active' : ''}
          onClick={() => setActiveSection('mission')}
        >
          📋 Mission
        </button>
        <button 
          className={activeSection === 'values' ? 'active' : ''}
          onClick={() => setActiveSection('values')}
        >
          ⭐ Valeurs
        </button>
        <button 
          className={activeSection === 'refuges' ? 'active' : ''}
          onClick={() => setActiveSection('refuges')}
        >
          🏛️ Refuges
        </button>
        <button 
          className={activeSection === 'gj' ? 'active' : ''}
          onClick={() => setActiveSection('gj')}
        >
          🎯 Génération Josué
        </button>
        <button 
          className={activeSection === 'styles' ? 'active' : ''}
          onClick={() => setActiveSection('styles')}
        >
          🎨 Styles Globaux
        </button>
      </div>

      <div className="crpt-settings-content">
        {/* HERO SECTION */}
        {activeSection === 'hero' && (
          <div className="crpt-section">
            <h2>🎯 Section Hero</h2>
            
            <div className="crpt-field">
              <label>Image de fond (URL)</label>
              <input
                type="text"
                value={settings.hero.backgroundImage}
                onChange={(e) => handleChange('hero', 'backgroundImage', e.target.value)}
                placeholder="/images/crpt-hero-bg.jpg"
              />
            </div>

            <div className="crpt-field">
              <label>Opacité de l'overlay (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.hero.overlayOpacity}
                onChange={(e) => handleChange('hero', 'overlayOpacity', parseInt(e.target.value))}
              />
              <span>{settings.hero.overlayOpacity}%</span>
            </div>

            <div className="crpt-field">
              <label>Logo URL</label>
              <input
                type="text"
                value={settings.hero.logoUrl}
                onChange={(e) => handleChange('hero', 'logoUrl', e.target.value)}
                placeholder="/images/crpt-logo.png"
              />
            </div>

            <div className="crpt-field">
              <label>Titre principal</label>
              <input
                type="text"
                value={settings.hero.title}
                onChange={(e) => handleChange('hero', 'title', e.target.value)}
              />
            </div>

            <div className="crpt-field-row">
              <div className="crpt-field">
                <label>Taille du titre</label>
                <input
                  type="text"
                  value={settings.hero.titleFontSize}
                  onChange={(e) => handleChange('hero', 'titleFontSize', e.target.value)}
                  placeholder="3.5rem"
                />
              </div>
              <div className="crpt-field">
                <label>Couleur du titre</label>
                <input
                  type="color"
                  value={settings.hero.titleColor}
                  onChange={(e) => handleChange('hero', 'titleColor', e.target.value)}
                />
              </div>
            </div>

            <div className="crpt-field">
              <label>Animation du titre</label>
              <select
                value={settings.hero.titleAnimation}
                onChange={(e) => handleChange('hero', 'titleAnimation', e.target.value)}
              >
                <option value="none">Aucune</option>
                <option value="fade-in">Fade In</option>
                <option value="slide-up">Slide Up</option>
                <option value="zoom-in">Zoom In</option>
              </select>
            </div>

            <div className="crpt-field">
              <label>Sous-titre</label>
              <textarea
                value={settings.hero.subtitle}
                onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
                rows="2"
              />
            </div>

            <div className="crpt-field-row">
              <div className="crpt-field">
                <label>Taille du sous-titre</label>
                <input
                  type="text"
                  value={settings.hero.subtitleFontSize}
                  onChange={(e) => handleChange('hero', 'subtitleFontSize', e.target.value)}
                />
              </div>
              <div className="crpt-field">
                <label>Couleur du sous-titre</label>
                <input
                  type="color"
                  value={settings.hero.subtitleColor}
                  onChange={(e) => handleChange('hero', 'subtitleColor', e.target.value)}
                />
              </div>
            </div>

            <h3>📊 Statistiques</h3>
            {settings.hero.stats.map((stat, index) => (
              <div key={index} className="crpt-stat-item">
                <input
                  type="text"
                  value={stat.icon}
                  onChange={(e) => {
                    const newStats = [...settings.hero.stats];
                    newStats[index].icon = e.target.value;
                    setSettings(prev => ({ ...prev, hero: { ...prev.hero, stats: newStats } }));
                  }}
                  placeholder="🏛️"
                  style={{ width: '60px' }}
                />
                <input
                  type="text"
                  value={stat.number}
                  onChange={(e) => {
                    const newStats = [...settings.hero.stats];
                    newStats[index].number = e.target.value;
                    setSettings(prev => ({ ...prev, hero: { ...prev.hero, stats: newStats } }));
                  }}
                  placeholder="5+"
                />
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => {
                    const newStats = [...settings.hero.stats];
                    newStats[index].label = e.target.value;
                    setSettings(prev => ({ ...prev, hero: { ...prev.hero, stats: newStats } }));
                  }}
                  placeholder="Refuges"
                />
              </div>
            ))}
          </div>
        )}

        {/* MISSION SECTION */}
        {activeSection === 'mission' && (
          <div className="crpt-section">
            <h2>📋 Section Mission</h2>
            
            <div className="crpt-field">
              <label>Badge</label>
              <input
                type="text"
                value={settings.mission.badge}
                onChange={(e) => handleChange('mission', 'badge', e.target.value)}
              />
            </div>

            <div className="crpt-field">
              <label>Couleur du badge</label>
              <input
                type="color"
                value={settings.mission.badgeColor}
                onChange={(e) => handleChange('mission', 'badgeColor', e.target.value)}
              />
            </div>

            <div className="crpt-field">
              <label>Titre</label>
              <input
                type="text"
                value={settings.mission.title}
                onChange={(e) => handleChange('mission', 'title', e.target.value)}
              />
            </div>

            <div className="crpt-field-row">
              <div className="crpt-field">
                <label>Taille du titre</label>
                <input
                  type="text"
                  value={settings.mission.titleFontSize}
                  onChange={(e) => handleChange('mission', 'titleFontSize', e.target.value)}
                />
              </div>
              <div className="crpt-field">
                <label>Couleur du titre</label>
                <input
                  type="color"
                  value={settings.mission.titleColor}
                  onChange={(e) => handleChange('mission', 'titleColor', e.target.value)}
                />
              </div>
            </div>

            <div className="crpt-field">
              <label>Texte principal (Lead)</label>
              <textarea
                value={settings.mission.leadText}
                onChange={(e) => handleChange('mission', 'leadText', e.target.value)}
                rows="3"
              />
            </div>

            <div className="crpt-field">
              <label>Texte secondaire</label>
              <textarea
                value={settings.mission.bodyText}
                onChange={(e) => handleChange('mission', 'bodyText', e.target.value)}
                rows="3"
              />
            </div>

            <h3>💳 Carte flottante</h3>
            <div className="crpt-field">
              <label>Icône</label>
              <input
                type="text"
                value={settings.mission.cardIcon}
                onChange={(e) => handleChange('mission', 'cardIcon', e.target.value)}
              />
            </div>

            <div className="crpt-field">
              <label>Titre de la carte</label>
              <input
                type="text"
                value={settings.mission.cardTitle}
                onChange={(e) => handleChange('mission', 'cardTitle', e.target.value)}
              />
            </div>

            <div className="crpt-field">
              <label>Description de la carte</label>
              <textarea
                value={settings.mission.cardDescription}
                onChange={(e) => handleChange('mission', 'cardDescription', e.target.value)}
                rows="2"
              />
            </div>
          </div>
        )}

        {/* VALUES SECTION */}
        {activeSection === 'values' && (
          <div className="crpt-section">
            <h2>⭐ Section Valeurs</h2>
            
            <div className="crpt-field">
              <label>Badge</label>
              <input
                type="text"
                value={settings.values.badge}
                onChange={(e) => handleChange('values', 'badge', e.target.value)}
              />
            </div>

            <div className="crpt-field">
              <label>Titre</label>
              <input
                type="text"
                value={settings.values.title}
                onChange={(e) => handleChange('values', 'title', e.target.value)}
              />
            </div>

            <h3>Liste des valeurs</h3>
            {settings.values.items.map((item, index) => (
              <div key={index} className="crpt-item-card">
                <div className="crpt-item-header">
                  <h4>Valeur {index + 1}</h4>
                  <button 
                    onClick={() => removeItem('values', index)}
                    className="crpt-btn-remove"
                  >
                    🗑️
                  </button>
                </div>
                <div className="crpt-field">
                  <label>Icône</label>
                  <input
                    type="text"
                    value={item.icon}
                    onChange={(e) => handleArrayChange('values', index, 'icon', e.target.value)}
                  />
                </div>
                <div className="crpt-field">
                  <label>Titre</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleArrayChange('values', index, 'title', e.target.value)}
                  />
                </div>
                <div className="crpt-field">
                  <label>Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleArrayChange('values', index, 'description', e.target.value)}
                    rows="2"
                  />
                </div>
                <div className="crpt-field">
                  <label>Couleur de l'icône</label>
                  <input
                    type="color"
                    value={item.iconColor}
                    onChange={(e) => handleArrayChange('values', index, 'iconColor', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button onClick={() => addItem('values')} className="crpt-btn-add">
              ➕ Ajouter une valeur
            </button>
          </div>
        )}

        {/* REFUGES SECTION */}
        {activeSection === 'refuges' && (
          <div className="crpt-section">
            <h2>🏛️ Section Refuges</h2>
            
            <div className="crpt-field">
              <label>Badge</label>
              <input
                type="text"
                value={settings.refuges.badge}
                onChange={(e) => handleChange('refuges', 'badge', e.target.value)}
              />
            </div>

            <div className="crpt-field">
              <label>Titre</label>
              <input
                type="text"
                value={settings.refuges.title}
                onChange={(e) => handleChange('refuges', 'title', e.target.value)}
              />
            </div>

            <div className="crpt-field">
              <label>Sous-titre</label>
              <input
                type="text"
                value={settings.refuges.subtitle}
                onChange={(e) => handleChange('refuges', 'subtitle', e.target.value)}
              />
            </div>

            <h3>Liste des refuges</h3>
            {settings.refuges.items.map((item, index) => (
              <div key={index} className="crpt-item-card">
                <div className="crpt-item-header">
                  <h4>{item.name || `Refuge ${index + 1}`}</h4>
                  <button 
                    onClick={() => removeItem('refuges', index)}
                    className="crpt-btn-remove"
                  >
                    🗑️
                  </button>
                </div>
                <div className="crpt-field-row">
                  <div className="crpt-field">
                    <label>Nom</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleArrayChange('refuges', index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="crpt-field">
                    <label>Région</label>
                    <input
                      type="text"
                      value={item.region}
                      onChange={(e) => handleArrayChange('refuges', index, 'region', e.target.value)}
                    />
                  </div>
                </div>
                <div className="crpt-field">
                  <label>Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleArrayChange('refuges', index, 'description', e.target.value)}
                    rows="2"
                  />
                </div>
                <div className="crpt-field">
                  <label>Adresse complète</label>
                  <input
                    type="text"
                    value={item.address || ''}
                    onChange={(e) => handleArrayChange('refuges', index, 'address', e.target.value)}
                    placeholder="123 Rue Example, 75001 Paris"
                  />
                </div>
                <div className="crpt-field-row">
                  <div className="crpt-field">
                    <label>Nom du dirigeant</label>
                    <input
                      type="text"
                      value={item.leaderName || ''}
                      onChange={(e) => handleArrayChange('refuges', index, 'leaderName', e.target.value)}
                      placeholder="Pasteur Jean Dupont"
                    />
                  </div>
                  <div className="crpt-field">
                    <label>Photo du dirigeant (URL)</label>
                    <input
                      type="text"
                      value={item.leaderPhoto || ''}
                      onChange={(e) => handleArrayChange('refuges', index, 'leaderPhoto', e.target.value)}
                      placeholder="/images/leaders/nom.jpg"
                    />
                  </div>
                </div>
                <div className="crpt-field-row">
                  <div className="crpt-field">
                    <label>Téléphone</label>
                    <input
                      type="text"
                      value={item.phone || ''}
                      onChange={(e) => handleArrayChange('refuges', index, 'phone', e.target.value)}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  <div className="crpt-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={item.email || ''}
                      onChange={(e) => handleArrayChange('refuges', index, 'email', e.target.value)}
                      placeholder="refuge@crpt.fr"
                    />
                  </div>
                </div>
                <div className="crpt-field-row">
                  <div className="crpt-field">
                    <label>Icône</label>
                    <input
                      type="text"
                      value={item.icon}
                      onChange={(e) => handleArrayChange('refuges', index, 'icon', e.target.value)}
                    />
                  </div>
                  <div className="crpt-field">
                    <label>Couleur</label>
                    <input
                      type="color"
                      value={item.iconColor}
                      onChange={(e) => handleArrayChange('refuges', index, 'iconColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => addItem('refuges')} className="crpt-btn-add">
              ➕ Ajouter un refuge
            </button>
          </div>
        )}

        {/* GÉNÉRATION JOSUÉ SECTION */}
        {activeSection === 'gj' && (
          <div className="crpt-section">
            <h2>🎯 Section Génération Josué</h2>
            
            <div className="crpt-field">
              <label>Badge</label>
              <input
                type="text"
                value={settings.generationJosue?.badge || ''}
                onChange={(e) => handleChange('generationJosue', 'badge', e.target.value)}
                placeholder="Notre Jeunesse"
              />
            </div>

            <div className="crpt-field-row">
              <div className="crpt-field">
                <label>Couleur du badge</label>
                <input
                  type="color"
                  value={settings.generationJosue?.badgeColor || '#ffffff'}
                  onChange={(e) => handleChange('generationJosue', 'badgeColor', e.target.value)}
                />
              </div>
              <div className="crpt-field">
                <label>Taille du titre</label>
                <input
                  type="text"
                  value={settings.generationJosue?.titleFontSize || '2.8rem'}
                  onChange={(e) => handleChange('generationJosue', 'titleFontSize', e.target.value)}
                />
              </div>
            </div>

            <div className="crpt-field">
              <label>Titre</label>
              <input
                type="text"
                value={settings.generationJosue?.title || ''}
                onChange={(e) => handleChange('generationJosue', 'title', e.target.value)}
                placeholder="Génération Josué"
              />
            </div>

            <div className="crpt-field-row">
              <div className="crpt-field">
                <label>Couleur du titre</label>
                <input
                  type="color"
                  value={settings.generationJosue?.titleColor || '#ffffff'}
                  onChange={(e) => handleChange('generationJosue', 'titleColor', e.target.value)}
                />
              </div>
              <div className="crpt-field">
                <label>Couleur du texte principal</label>
                <input
                  type="color"
                  value={settings.generationJosue?.leadTextColor || '#f0f0f0'}
                  onChange={(e) => handleChange('generationJosue', 'leadTextColor', e.target.value)}
                />
              </div>
            </div>

            <div className="crpt-field">
              <label>Texte principal</label>
              <textarea
                value={settings.generationJosue?.leadText || ''}
                onChange={(e) => handleChange('generationJosue', 'leadText', e.target.value)}
                rows="3"
                placeholder="Le mouvement jeunesse de la CRPT..."
              />
            </div>

            <h3>Caractéristiques / Activités</h3>
            {(settings.generationJosue?.features || []).map((feature, index) => (
              <div key={index} className="crpt-stat-item">
                <input
                  type="text"
                  value={feature.icon}
                  onChange={(e) => {
                    const newFeatures = [...(settings.generationJosue?.features || [])];
                    newFeatures[index].icon = e.target.value;
                    setSettings(prev => ({ 
                      ...prev, 
                      generationJosue: { ...prev.generationJosue, features: newFeatures } 
                    }));
                  }}
                  placeholder="✨"
                  style={{ width: '80px' }}
                />
                <input
                  type="text"
                  value={feature.text}
                  onChange={(e) => {
                    const newFeatures = [...(settings.generationJosue?.features || [])];
                    newFeatures[index].text = e.target.value;
                    setSettings(prev => ({ 
                      ...prev, 
                      generationJosue: { ...prev.generationJosue, features: newFeatures } 
                    }));
                  }}
                  placeholder="Rencontres mensuelles de louange"
                />
                <button
                  onClick={() => {
                    const newFeatures = (settings.generationJosue?.features || []).filter((_, i) => i !== index);
                    setSettings(prev => ({ 
                      ...prev, 
                      generationJosue: { ...prev.generationJosue, features: newFeatures } 
                    }));
                  }}
                  className="crpt-btn-remove"
                  style={{ width: 'auto', padding: '8px 12px' }}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button 
              onClick={() => {
                const newFeatures = [...(settings.generationJosue?.features || []), { icon: '✨', text: 'Nouvelle activité' }];
                setSettings(prev => ({ 
                  ...prev, 
                  generationJosue: { ...prev.generationJosue, features: newFeatures } 
                }));
              }}
              className="crpt-btn-add"
            >
              ➕ Ajouter une activité
            </button>

            <h3>Bouton d'action</h3>
            <div className="crpt-field">
              <label>Texte du bouton</label>
              <input
                type="text"
                value={settings.generationJosue?.buttonText || ''}
                onChange={(e) => handleChange('generationJosue', 'buttonText', e.target.value)}
                placeholder="Découvrir Génération Josué"
              />
            </div>

            <div className="crpt-field">
              <label>Lien du bouton</label>
              <input
                type="text"
                value={settings.generationJosue?.buttonLink || '/'}
                onChange={(e) => handleChange('generationJosue', 'buttonLink', e.target.value)}
                placeholder="/"
              />
            </div>

            <div className="crpt-field">
              <label>Emoji visuel</label>
              <input
                type="text"
                value={settings.generationJosue?.visualEmoji || '🎯'}
                onChange={(e) => handleChange('generationJosue', 'visualEmoji', e.target.value)}
                placeholder="🎯"
              />
            </div>

            <h3>Couleurs de fond (dégradé)</h3>
            <div className="crpt-field-row">
              <div className="crpt-field">
                <label>Couleur de début</label>
                <input
                  type="color"
                  value={settings.generationJosue?.backgroundColor || '#667eea'}
                  onChange={(e) => handleChange('generationJosue', 'backgroundColor', e.target.value)}
                />
              </div>
              <div className="crpt-field">
                <label>Couleur de fin</label>
                <input
                  type="color"
                  value={settings.generationJosue?.gradientColor || '#764ba2'}
                  onChange={(e) => handleChange('generationJosue', 'gradientColor', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STYLES GLOBAUX */}
        {activeSection === 'styles' && (
          <div className="crpt-section">
            <h2>🎨 Styles Globaux</h2>
            
            <h3>Couleurs</h3>
            <div className="crpt-color-grid">
              <div className="crpt-field">
                <label>Couleur primaire</label>
                <input
                  type="color"
                  value={settings.styles.primaryColor}
                  onChange={(e) => handleChange('styles', 'primaryColor', e.target.value)}
                />
              </div>
              <div className="crpt-field">
                <label>Couleur secondaire</label>
                <input
                  type="color"
                  value={settings.styles.secondaryColor}
                  onChange={(e) => handleChange('styles', 'secondaryColor', e.target.value)}
                />
              </div>
              <div className="crpt-field">
                <label>Couleur d'accent</label>
                <input
                  type="color"
                  value={settings.styles.accentColor}
                  onChange={(e) => handleChange('styles', 'accentColor', e.target.value)}
                />
              </div>
            </div>

            <h3>Typographie</h3>
            <div className="crpt-field">
              <label>Police principale</label>
              <input
                type="text"
                value={settings.styles.fontFamily}
                onChange={(e) => handleChange('styles', 'fontFamily', e.target.value)}
              />
            </div>

            <h3>Effets</h3>
            <div className="crpt-checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.styles.enableAnimations}
                  onChange={(e) => handleChange('styles', 'enableAnimations', e.target.checked)}
                />
                Activer les animations
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.styles.enableHoverEffects}
                  onChange={(e) => handleChange('styles', 'enableHoverEffects', e.target.checked)}
                />
                Effets au survol
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.styles.enableGlassmorphism}
                  onChange={(e) => handleChange('styles', 'enableGlassmorphism', e.target.checked)}
                />
                Effet glassmorphism
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.styles.enableParallax}
                  onChange={(e) => handleChange('styles', 'enableParallax', e.target.checked)}
                />
                Effet parallax
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="crpt-settings-footer">
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="crpt-btn-save"
        >
          {loading ? '⏳ Sauvegarde...' : '💾 Enregistrer tous les paramètres'}
        </button>
      </div>
    </div>
  );
};

export default CRPTSettingsPage;
