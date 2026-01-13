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
  
  // Liste des responsables disponibles
  const [responsables, setResponsables] = useState([]);
  const [selectedResponsables, setSelectedResponsables] = useState([]);
  const [showResponsablesList, setShowResponsablesList] = useState(false);

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
    fetchMessages();
    fetchResponsables();
  }, [activeTab, token]);

  const fetchResponsables = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get('/api/messages/responsables', {
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
                  <option value="specific">👤 Sélection individuelle</option>
                </select>
              </div>

              {/* Liste de sélection des responsables */}
              {showResponsablesList && (
                <div className="form-group responsables-selection">
                  <div className="selection-header">
                    <label>Sélectionner les responsables ({selectedResponsables.length} sélectionné(s))</label>
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
            </div>

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
            const isUnread = activeTab === 'inbox' && user && 
              message.recipients?.some(r => r.user?._id === user._id && !r.read);
            
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
