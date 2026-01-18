import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { MailIcon, UserIcon, ClockIcon, AlertTriangleIcon } from '../components/Icons';
import '../styles/MessagesPage.css';

function MessagesPage() {
  const { token, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  // États pour édition et suppression
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editForm, setEditForm] = useState({ subject: '', content: '' });
  
  // Liste des responsables disponibles
  const [responsables, setResponsables] = useState([]);
  const [selectedResponsables, setSelectedResponsables] = useState([]);
  const [showResponsablesList, setShowResponsablesList] = useState(false);
  
  // Formulaire nouveau message
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    recipientType: 'all-responsables',
    recipientIds: [],
    isAnonymous: false,
    priority: 'normal'
  });

  useEffect(() => {
    if (!token) return;
    fetchMessages();
    fetchResponsables();
  }, [activeTab, token]);

  const fetchResponsables = async () => {
    if (!token) return;
    
    try {
      // Si l'utilisateur est référent, responsable ou admin, récupérer tous les utilisateurs
      // Sinon, récupérer uniquement les responsables
      const endpoint = user && ['referent', 'responsable', 'admin'].includes(user.role) 
        ? '/api/messages/all-users'
        : '/api/messages/responsables';
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResponsables(response.data || []);
    } catch (error) {
      console.error('Erreur chargement responsables:', error);
    }
  };

  const fetchMessages = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const endpoint = activeTab === 'inbox' ? '/api/messages/inbox' : '/api/messages/sent';
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages || []);
      
      // Notifier le Header pour mettre à jour le compteur
      if (activeTab === 'inbox') {
        window.dispatchEvent(new Event('messagesUpdated'));
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleResponsableSelection = (responsableId) => {
    setSelectedResponsables(prev => {
      if (prev.includes(responsableId)) {
        return prev.filter(id => id !== responsableId);
      } else {
        return [...prev, responsableId];
      }
    });
  };

  const selectAllResponsables = () => {
    setSelectedResponsables(responsables.map(r => r._id));
  };

  const deselectAllResponsables = () => {
    setSelectedResponsables([]);
  };

  const handleRecipientTypeChange = (type) => {
    setNewMessage({ ...newMessage, recipientType: type });
    setShowResponsablesList(type === 'specific');
    if (type !== 'specific') {
      setSelectedResponsables([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.subject.trim() || !newMessage.content.trim()) {
      alert('Le sujet et le contenu sont obligatoires');
      return;
    }

    if (newMessage.recipientType === 'specific' && selectedResponsables.length === 0) {
      alert('Veuillez sélectionner au moins un destinataire');
      return;
    }

    const messageData = {
      ...newMessage,
      recipientIds: newMessage.recipientType === 'specific' ? selectedResponsables : []
    };

    try {
      await axios.post('/api/messages', messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Message envoyé avec succès !');
      setShowNewMessage(false);
      setNewMessage({
        subject: '',
        content: '',
        recipientType: 'all-responsables',
        recipientIds: [],
        isAnonymous: false,
        priority: 'normal'
      });
      setSelectedResponsables([]);
      setShowResponsablesList(false);
      fetchMessages();
      
      // Notifier le Header pour mettre à jour le compteur
      window.dispatchEvent(new Event('messagesUpdated'));
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
    }
  };

  const handleViewMessage = async (messageId) => {
    try {
      const response = await axios.get(`/api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedMessage(response.data.message);
    } catch (error) {
      console.error('Erreur récupération message:', error);
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setEditForm({ subject: message.subject, content: message.content });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    if (!editForm.subject.trim() || !editForm.content.trim()) {
      alert('Le sujet et le contenu sont obligatoires');
      return;
    }

    try {
      await axios.patch(
        `/api/messages/${editingMessage._id}/edit`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Message modifié avec succès !');
      setShowEditModal(false);
      setEditingMessage(null);
      fetchMessages();
      
      if (selectedMessage && selectedMessage._id === editingMessage._id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la modification du message');
    }
  };

  const handleDeleteForMe = async (messageId) => {
    if (!window.confirm('Voulez-vous supprimer ce message de votre boîte de réception ?')) {
      return;
    }

    try {
      await axios.patch(
        `/api/messages/${messageId}/delete-for-me`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Message supprimé de votre boîte de réception');
      fetchMessages();
      
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleDeleteForAll = async (messageId) => {
    if (!window.confirm('⚠️ Voulez-vous supprimer ce message pour TOUS les destinataires ? Cette action est irréversible.')) {
      return;
    }

    try {
      await axios.delete(
        `/api/messages/${messageId}/delete-for-all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Message supprimé pour tous les destinataires');
      fetchMessages();
      
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const canEditMessage = (message) => {
    if (!message || !message.sender || !user) return false;
    if (message.sender._id !== user._id) return false;
    
    const messageAge = (new Date() - new Date(message.createdAt)) / 1000 / 60; // en minutes
    return messageAge <= 30;
  };

  const canDeleteForAll = (message) => {
    if (!message || !message.sender || !user) return false;
    if (message.sender._id !== user._id) return false;
    
    // Vérifier qu'aucun destinataire n'a lu le message
    return !message.recipients.some(r => r.read === true);
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { label: 'Faible', className: 'priority-low' },
      normal: { label: 'Normal', className: 'priority-normal' },
      high: { label: 'Élevée', className: 'priority-high' },
      urgent: { label: 'Urgent', className: 'priority-urgent' }
    };
    return badges[priority] || badges.normal;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Protection: Vérifier que l'utilisateur est connecté
  if (!token) {
    return (
      <div className="messages-page" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>⚠️ Accès refusé</h2>
        <p>Vous devez être connecté pour accéder à la messagerie.</p>
        <a href="/login" style={{ color: '#667eea', textDecoration: 'underline' }}>Se connecter</a>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1>📬 Messagerie</h1>
        <button className="btn-new-message" onClick={() => setShowNewMessage(true)}>
          ✉️ Nouveau message
        </button>
      </div>

      {/* Onglets */}
      <div className="messages-tabs">
        <button 
          className={`tab-btn ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
        >
          📥 Boîte de réception
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
        >
          📤 Messages envoyés
        </button>
      </div>

      {/* Modal nouveau message */}
      {showNewMessage && (
        <div className="modal-overlay" onClick={() => setShowNewMessage(false)}>
          <div className="modal-content message-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✉️ Nouveau message</h2>
              <button className="btn-close" onClick={() => setShowNewMessage(false)}>×</button>
            </div>

            <form onSubmit={handleSendMessage}>
              <div className="form-group">
                <label>Destinataires</label>
                <select 
                  value={newMessage.recipientType}
                  onChange={(e) => handleRecipientTypeChange(e.target.value)}
                  className="form-input"
                >
                  <option value="all-responsables">📢 Tous les responsables</option>
                  {/* Option "Tous les utilisateurs" visible pour référents, responsables et admins */}
                  {user && ['referent', 'responsable', 'admin'].includes(user.role) && (
                    <option value="all-users">👥 Tous les utilisateurs</option>
                  )}
                  <option value="specific">👤 Sélection individuelle</option>
                </select>
              </div>

              {/* Liste de sélection des responsables */}
              {showResponsablesList && (
                <div className="form-group responsables-selection">
                  <div className="selection-header">
                    <label>
                      {user && ['referent', 'responsable', 'admin'].includes(user.role) 
                        ? `Sélectionner les utilisateurs (${selectedResponsables.length} sélectionné(s))`
                        : `Sélectionner les responsables (${selectedResponsables.length} sélectionné(s))`
                      }
                    </label>
                    <div className="selection-actions">
                      <button 
                        type="button" 
                        className="btn-select-all"
                        onClick={selectAllResponsables}
                      >
                        ✓ Tout sélectionner
                      </button>
                      <button 
                        type="button" 
                        className="btn-deselect-all"
                        onClick={deselectAllResponsables}
                      >
                        ✗ Tout désélectionner
                      </button>
                    </div>
                  </div>
                  
                  <div className="responsables-list">
                    {responsables.length === 0 ? (
                      <p className="no-responsables">Aucun responsable disponible</p>
                    ) : (
                      responsables.map(responsable => (
                        <div 
                          key={responsable._id} 
                          className={`responsable-item ${
                            selectedResponsables.includes(responsable._id) ? 'selected' : ''
                          }`}
                          onClick={() => toggleResponsableSelection(responsable._id)}
                        >
                          <input 
                            type="checkbox"
                            checked={selectedResponsables.includes(responsable._id)}
                            onChange={() => toggleResponsableSelection(responsable._id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="responsable-info">
                            <div className="responsable-name">
                              {responsable.firstName} {responsable.lastName}
                            </div>
                            <div className="responsable-role">
                              {responsable.role === 'admin' && '👑 Admin'}
                              {responsable.role === 'responsable' && '⭐ Responsable'}
                              {responsable.role === 'referent' && '📋 Référent'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Priorité</label>
                <select 
                  value={newMessage.priority}
                  onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                  className="form-input"
                >
                  <option value="low">Faible</option>
                  <option value="normal">Normal</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sujet *</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  className="form-input"
                  placeholder="Sujet du message"
                  maxLength={200}
                  required
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  className="form-textarea"
                  placeholder="Écrivez votre message ici..."
                  rows={8}
                  maxLength={5000}
                  required
                />
              </div>

              <div className="form-group-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={newMessage.isAnonymous}
                    onChange={(e) => setNewMessage({ ...newMessage, isAnonymous: e.target.checked })}
                  />
                  Envoyer de manière anonyme
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowNewMessage(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-send">
                  📨 Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de message */}
      {showEditModal && editingMessage && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content message-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Modifier le message</h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Sujet</label>
                <input
                  type="text"
                  value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                  className="form-input"
                  placeholder="Objet du message"
                  maxLength="200"
                  required
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="form-textarea"
                  placeholder="Votre message..."
                  rows={10}
                  maxLength="5000"
                  required
                />
              </div>

              <div className="form-info" style={{
                background: '#fff3cd',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#856404'
              }}>
                ⚠️ Vous pouvez modifier ce message dans les 30 minutes suivant son envoi.
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-send">
                  💾 Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Détail message */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="modal-content message-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedMessage.subject}</h2>
              <button className="btn-close" onClick={() => setSelectedMessage(null)}>×</button>
            </div>

            <div className="message-meta">
              <div className="message-sender">
                {selectedMessage.isAnonymous ? (
                  <span className="anonymous-badge">👤 Anonyme</span>
                ) : (
                  <span className="sender-name">
                    De : {selectedMessage.sender?.firstName} {selectedMessage.sender?.lastName}
                  </span>
                )}
              </div>
              <div className="message-date">
                <ClockIcon size={16} />
                {formatDate(selectedMessage.createdAt)}
              </div>
              <div className={`priority-badge ${getPriorityBadge(selectedMessage.priority).className}`}>
                {getPriorityBadge(selectedMessage.priority).label}
              </div>
            </div>

            <div className="message-content">
              <p>{selectedMessage.content}</p>
              
              {/* Indicateur si le message a été modifié */}
              {selectedMessage.isEdited && (
                <div className="edited-indicator" style={{ 
                  marginTop: '10px', 
                  fontSize: '13px', 
                  color: '#6b7280', 
                  fontStyle: 'italic' 
                }}>
                  ✏️ Modifié le {formatDate(selectedMessage.editedAt)}
                </div>
              )}
            </div>

            {/* Actions sur le message */}
            {activeTab === 'sent' && selectedMessage.sender && selectedMessage.sender._id === user._id && (
              <div className="message-actions" style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb'
              }}>
                {canEditMessage(selectedMessage) && (
                  <button 
                    onClick={() => handleEditMessage(selectedMessage)}
                    className="btn-edit"
                    style={{
                      padding: '10px 20px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ✏️ Modifier
                  </button>
                )}
                
                {canDeleteForAll(selectedMessage) && (
                  <button 
                    onClick={() => handleDeleteForAll(selectedMessage._id)}
                    className="btn-delete-all"
                    style={{
                      padding: '10px 20px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🗑️ Supprimer pour tous
                  </button>
                )}
                
                <button 
                  onClick={() => handleDeleteForMe(selectedMessage._id)}
                  className="btn-delete-me"
                  style={{
                    padding: '10px 20px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Supprimer pour moi
                </button>
              </div>
            )}

            {activeTab === 'inbox' && (
              <div className="message-actions" style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button 
                  onClick={() => handleDeleteForMe(selectedMessage._id)}
                  className="btn-delete-me"
                  style={{
                    padding: '10px 20px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Supprimer
                </button>
              </div>
            )}

            {/* Réponses */}
            {selectedMessage.replies && selectedMessage.replies.length > 0 && (
              <div className="message-replies">
                <h3>Réponses ({selectedMessage.replies.length})</h3>
                {selectedMessage.replies.map((reply, index) => (
                  <div key={index} className="reply-item">
                    <div className="reply-header">
                      <span className="reply-author">
                        {reply.author.firstName} {reply.author.lastName}
                      </span>
                      <span className="reply-date">{formatDate(reply.createdAt)}</span>
                    </div>
                    <div className="reply-content">
                      {reply.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Liste des messages */}
      <div className="messages-list">
        {loading ? (
          <div className="loading-state">Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <MailIcon size={64} color="#ccc" />
            <p>Aucun message</p>
          </div>
        ) : (
          messages.map((message) => {
            // Protection complète contre les valeurs null
            const isUnread = activeTab === 'inbox' && 
              user && 
              user._id &&
              Array.isArray(message.recipients) &&
              message.recipients.some(r => {
                try {
                  return r && r.user && r.user._id === user._id && !r.read;
                } catch (err) {
                  console.error('Erreur vérification read status:', err);
                  return false;
                }
              });
            
            return (
              <div 
                key={message._id} 
                className={`message-item ${isUnread ? 'unread' : ''}`}
                onClick={() => handleViewMessage(message._id)}
              >
                <div className="message-item-header">
                  <div className="message-subject">
                    {isUnread && <span className="unread-dot">●</span>}
                    {message.subject}
                    {message.isEdited && (
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '12px', 
                        color: '#6b7280',
                        fontStyle: 'italic'
                      }}>
                        ✏️ modifié
                      </span>
                    )}
                  </div>
                  <div className="message-date-small">
                    {formatDate(message.createdAt)}
                  </div>
                </div>
                
                <div className="message-item-meta">
                  <div className="message-sender-small">
                    {message.isAnonymous ? '👤 Anonyme' : 
                      activeTab === 'sent' 
                        ? `À: ${message.recipientType === 'all-responsables' ? 'Tous les responsables' : message.recipients.length + ' destinataire(s)'}`
                        : `De: ${message.sender?.firstName} ${message.sender?.lastName}`
                    }
                  </div>
                  <div className={`priority-badge-small ${getPriorityBadge(message.priority).className}`}>
                    {message.priority === 'urgent' && '🚨'}
                    {message.priority === 'high' && '⚠️'}
                  </div>
                </div>
                
                <div className="message-preview">
                  {message.content.substring(0, 100)}...
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MessagesPage;
