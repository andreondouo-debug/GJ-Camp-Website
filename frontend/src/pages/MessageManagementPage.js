import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { MailIcon, UserIcon, ClockIcon, AlertTriangleIcon, UsersIcon } from '../components/Icons';
import '../styles/MessagesPage.css';

function MessageManagementPage() {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [replyContent, setReplyContent] = useState('');
  const [replyType, setReplyType] = useState('private');
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [token]);

  const fetchMessages = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/messages/inbox', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages || []);
      
      // Notifier le Header pour mettre à jour le compteur
      window.dispatchEvent(new Event('messagesUpdated'));
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (messageId) => {
    try {
      const response = await axios.get(`/api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedMessage(response.data.message);
      setShowReplyForm(false);
      setReplyContent('');
    } catch (error) {
      console.error('Erreur récupération message:', error);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      alert('Veuillez entrer une réponse');
      return;
    }

    try {
      await axios.post(`/api/messages/${selectedMessage._id}/reply`, {
        content: replyContent,
        replyType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Réponse envoyée avec succès !');
      setReplyContent('');
      setShowReplyForm(false);
      handleViewMessage(selectedMessage._id);
      fetchMessages();
      
      // Notifier le Header pour mettre à jour le compteur
      window.dispatchEvent(new Event('messagesUpdated'));
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de l\'envoi de la réponse');
    }
  };

  const handleArchive = async (messageId) => {
    try {
      await axios.patch(`/api/messages/${messageId}/archive`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Message archivé');
      setSelectedMessage(null);
      fetchMessages();
      
      // Notifier le Header pour mettre à jour le compteur
      window.dispatchEvent(new Event('messagesUpdated'));
    } catch (error) {
      alert('Erreur lors de l\'archivage');
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { label: 'Faible', className: 'priority-low', icon: '' },
      normal: { label: 'Normal', className: 'priority-normal', icon: '' },
      high: { label: 'Élevée', className: 'priority-high', icon: '⚠️' },
      urgent: { label: 'Urgent', className: 'priority-urgent', icon: '🚨' }
    };
    return badges[priority] || badges.normal;
  };

  const getStatusBadge = (status) => {
    const badges = {
      unread: { label: 'Non lu', className: 'status-unread' },
      read: { label: 'Lu', className: 'status-read' },
      replied: { label: 'Répondu', className: 'status-replied' },
      archived: { label: 'Archivé', className: 'status-archived' }
    };
    return badges[status] || badges.unread;
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

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    if (filter === 'unread') return msg.status === 'unread';
    if (filter === 'urgent') return msg.priority === 'urgent' || msg.priority === 'high';
    if (filter === 'replied') return msg.status === 'replied';
    return true;
  });

  return (
    <div className="messages-page message-management">
      <div className="messages-header">
        <div>
          <h1>📨 Gestion des Messages</h1>
          <p className="header-subtitle">Messages reçus des utilisateurs</p>
        </div>
        <div className="messages-stats">
          <div className="stat-item">
            <span className="stat-number">{messages.filter(m => m.status === 'unread').length}</span>
            <span className="stat-label">Non lus</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{messages.filter(m => m.priority === 'urgent' || m.priority === 'high').length}</span>
            <span className="stat-label">Prioritaires</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{messages.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="messages-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous
        </button>
        <button 
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Non lus
        </button>
        <button 
          className={`filter-btn ${filter === 'urgent' ? 'active' : ''}`}
          onClick={() => setFilter('urgent')}
        >
          Prioritaires
        </button>
        <button 
          className={`filter-btn ${filter === 'replied' ? 'active' : ''}`}
          onClick={() => setFilter('replied')}
        >
          Répondus
        </button>
      </div>

      {/* Détail message avec réponse */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="modal-content message-detail-admin" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedMessage.subject}</h2>
                <div className="message-badges">
                  <span className={`status-badge ${getStatusBadge(selectedMessage.status).className}`}>
                    {getStatusBadge(selectedMessage.status).label}
                  </span>
                  <span className={`priority-badge ${getPriorityBadge(selectedMessage.priority).className}`}>
                    {getPriorityBadge(selectedMessage.priority).icon} {getPriorityBadge(selectedMessage.priority).label}
                  </span>
                </div>
              </div>
              <button className="btn-close" onClick={() => setSelectedMessage(null)}>×</button>
            </div>

            <div className="message-meta">
              <div className="message-sender">
                {selectedMessage.isAnonymous ? (
                  <span className="anonymous-badge">
                    <UserIcon size={16} />
                    Message Anonyme
                  </span>
                ) : (
                  <div className="sender-info">
                    <div className="sender-avatar">
                      {selectedMessage.sender?.firstName?.[0]}{selectedMessage.sender?.lastName?.[0]}
                    </div>
                    <div>
                      <div className="sender-name">
                        {selectedMessage.sender?.firstName} {selectedMessage.sender?.lastName}
                      </div>
                      <div className="sender-email">{selectedMessage.sender?.email}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="message-date">
                <ClockIcon size={16} />
                {formatDate(selectedMessage.createdAt)}
              </div>
            </div>

            <div className="message-content">
              <h4>Message :</h4>
              <p>{selectedMessage.content}</p>
            </div>

            {/* Réponses existantes */}
            {selectedMessage.replies && selectedMessage.replies.length > 0 && (
              <div className="message-replies">
                <h3>✅ Réponses ({selectedMessage.replies.length})</h3>
                {selectedMessage.replies.map((reply, index) => (
                  <div key={index} className="reply-item">
                    <div className="reply-header">
                      <div className="reply-author-info">
                        <div className="reply-avatar">
                          {reply.author.firstName?.[0]}{reply.author.lastName?.[0]}
                        </div>
                        <div>
                          <div className="reply-author">
                            {reply.author.firstName} {reply.author.lastName}
                          </div>
                          <div className="reply-date">{formatDate(reply.createdAt)}</div>
                        </div>
                      </div>
                      <span className="reply-type-badge">
                        {reply.replyType === 'private' && '🔒 Privé'}
                        {reply.replyType === 'all-users' && '📢 Tous les utilisateurs'}
                        {reply.replyType === 'all-responsables' && '👥 Tous les responsables'}
                      </span>
                    </div>
                    <div className="reply-content">
                      {reply.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire de réponse */}
            <div className="reply-section">
              {!showReplyForm ? (
                <button className="btn-reply" onClick={() => setShowReplyForm(true)}>
                  💬 Répondre
                </button>
              ) : (
                <form onSubmit={handleSendReply} className="reply-form">
                  <div className="form-group">
                    <label>Type de réponse</label>
                    <select 
                      value={replyType}
                      onChange={(e) => setReplyType(e.target.value)}
                      className="form-input"
                    >
                      <option value="private">Réponse privée (uniquement à l'expéditeur)</option>
                      {/* Option visible uniquement pour référents, responsables et admins */}
                      {user && ['referent', 'responsable', 'admin'].includes(user.role) && (
                        <>
                          <option value="all-users">Envoyer à tous les utilisateurs</option>
                          <option value="all-responsables">Envoyer à tous les responsables</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Votre réponse</label>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="form-textarea"
                      placeholder="Écrivez votre réponse..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => setShowReplyForm(false)}>
                      Annuler
                    </button>
                    <button type="submit" className="btn-send">
                      📨 Envoyer la réponse
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="message-actions">
              <button 
                className="btn-archive"
                onClick={() => handleArchive(selectedMessage._id)}
              >
                📁 Archiver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des messages */}
      <div className="messages-list">
        {loading ? (
          <div className="loading-state">Chargement...</div>
        ) : filteredMessages.length === 0 ? (
          <div className="empty-state">
            <MailIcon size={64} color="#ccc" />
            <p>Aucun message</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div 
              key={message._id} 
              className={`message-item ${message.status === 'unread' ? 'unread' : ''} ${message.priority === 'urgent' ? 'urgent' : ''}`}
              onClick={() => handleViewMessage(message._id)}
            >
              <div className="message-item-header">
                <div className="message-subject">
                  {message.status === 'unread' && <span className="unread-dot">●</span>}
                  {(message.priority === 'urgent' || message.priority === 'high') && 
                    <span className="urgent-icon">{getPriorityBadge(message.priority).icon}</span>
                  }
                  {message.subject}
                </div>
                <div className="message-badges-small">
                  <span className={`status-badge-small ${getStatusBadge(message.status).className}`}>
                    {getStatusBadge(message.status).label}
                  </span>
                </div>
              </div>
              
              <div className="message-item-meta">
                <div className="message-sender-small">
                  {message.isAnonymous ? '👤 Anonyme' : 
                    `De: ${message.sender?.firstName} ${message.sender?.lastName}`
                  }
                </div>
                <div className="message-date-small">
                  {formatDate(message.createdAt)}
                </div>
              </div>
              
              <div className="message-preview">
                {message.content.substring(0, 150)}...
              </div>

              {message.replies && message.replies.length > 0 && (
                <div className="message-replies-count">
                  💬 {message.replies.length} réponse{message.replies.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MessageManagementPage;
