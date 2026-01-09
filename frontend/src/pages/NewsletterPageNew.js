import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import '../styles/Newsletter.css';

function NewsletterPage() {
  const { user, token } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const observer = useRef();

  // Formulaire de création de post
  const [newPost, setNewPost] = useState({
    text: '',
    linkUrl: '',
    linkText: '',
    videoUrl: ''
  });
  const [selectedFiles, setSelectedFiles] = useState({
    image: null,
    video: null,
    document: null
  });
  const [previewUrls, setPreviewUrls] = useState({
    image: null,
    video: null
  });

  // Sondage
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollData, setPollData] = useState({
    question: '',
    options: ['', ''],
    pollType: 'single',
    endsAt: ''
  });

  // Commentaires
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editPostData, setEditPostData] = useState({ text: '', linkUrl: '', linkText: '', videoUrl: '' });

  // Emoji Picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState({});
  const [showEditPostEmojiPicker, setShowEditPostEmojiPicker] = useState(false);
  const [showEditCommentEmojiPicker, setShowEditCommentEmojiPicker] = useState(false);

  // Charger les posts
  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/posts?page=${pageNum}&limit=10`);
      
      const newPosts = response.data?.posts || [];
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      setHasMore(response.data?.currentPage < response.data?.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement posts:', error);
      setPosts([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, false);
  }, []);

  // Infinite scroll
  const lastPostRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, true);
    }
  }, [page]);

  // Gestion des fichiers
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFiles({ ...selectedFiles, [type]: file });
      
      // Aperçu pour images et vidéos
      if (type === 'image' || type === 'video') {
        const url = URL.createObjectURL(file);
        setPreviewUrls({ ...previewUrls, [type]: url });
      }
    }
  };

  const removeFile = (type) => {
    setSelectedFiles({ ...selectedFiles, [type]: null });
    setPreviewUrls({ ...previewUrls, [type]: null });
  };

  // Créer un post
  const handleCreatePost = async () => {
    console.log('🚀 handleCreatePost appelé');
    console.log('Token:', token ? 'Présent' : 'Absent');
    console.log('Text:', newPost.text);
    
    if (!newPost.text.trim()) {
      alert('Veuillez entrer un message');
      return;
    }

    // Validation sondage
    if (showPollForm) {
      if (!pollData.question.trim()) {
        alert('Veuillez entrer une question pour le sondage');
        return;
      }
      const validOptions = pollData.options.filter(opt => opt.trim().length > 0);
      if (validOptions.length < 2) {
        alert('Un sondage doit avoir au moins 2 options');
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append('text', newPost.text);
      
      if (newPost.linkUrl) {
        formData.append('linkUrl', newPost.linkUrl);
        formData.append('linkText', newPost.linkText || newPost.linkUrl);
      }
      
      if (newPost.videoUrl) {
        formData.append('videoUrl', newPost.videoUrl);
      }

      // Ajouter le sondage
      if (showPollForm && pollData.question.trim()) {
        formData.append('pollQuestion', pollData.question);
        const validOptions = pollData.options.filter(opt => opt.trim().length > 0);
        formData.append('pollOptions', JSON.stringify(validOptions));
        formData.append('pollType', pollData.pollType);
        if (pollData.endsAt) {
          formData.append('pollEndsAt', pollData.endsAt);
        }
      }
      
      if (selectedFiles.image) formData.append('image', selectedFiles.image);
      if (selectedFiles.video) formData.append('video', selectedFiles.video);
      if (selectedFiles.document) formData.append('document', selectedFiles.document);

      console.log('📤 Envoi de la requête POST /api/posts...');
      
      const response = await axios.post('/api/posts', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 secondes timeout
      });

      console.log('✅ Réponse reçue:', response.data);

      setPosts([response.data.post, ...posts]);
      setNewPost({ text: '', linkUrl: '', linkText: '', videoUrl: '' });
      setSelectedFiles({ image: null, video: null, document: null });
      setPreviewUrls({ image: null, video: null });
      setPollData({ question: '', options: ['', ''], pollType: 'single', endsAt: '' });
      setShowPollForm(false);
      setShowPostForm(false);
      alert('✅ Post publié avec succès !');
    } catch (error) {
      console.error('❌ Erreur création post:', error);
      console.error('❌ Détails erreur:', error.response?.data || error.message);
      alert('❌ Erreur lors de la publication: ' + (error.response?.data?.message || error.message));
    }
  };

  // Liker un post
  const handleLike = async (postId) => {
    if (!token) {
      alert('Vous devez être connecté pour liker');
      return;
    }

    try {
      const response = await axios.post(`/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(posts.map(p => 
        p._id === postId ? { ...p, likes: response.data.likes } : p
      ));
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  // Emoji Handlers
  const handleEmojiClick = (emojiData) => {
    setNewPost({ ...newPost, text: newPost.text + emojiData.emoji });
    setShowEmojiPicker(false);
  };

  const handleCommentEmojiClick = (postId, emojiData) => {
    setNewComment({ ...newComment, [postId]: (newComment[postId] || '') + emojiData.emoji });
    setShowCommentEmojiPicker({ ...showCommentEmojiPicker, [postId]: false });
  };

  const handleEditPostEmojiClick = (emojiData) => {
    setEditPostData({ ...editPostData, text: editPostData.text + emojiData.emoji });
    setShowEditPostEmojiPicker(false);
  };

  const handleEditCommentEmojiClick = (emojiData) => {
    setEditCommentText(editCommentText + emojiData.emoji);
    setShowEditCommentEmojiPicker(false);
  };

  // Ajouter un commentaire
  const handleAddComment = async (postId) => {
    if (!token) {
      alert('Vous devez être connecté pour commenter');
      return;
    }

    if (!newComment[postId] || !newComment[postId].trim()) {
      return;
    }

    try {
      const response = await axios.post(`/api/posts/${postId}/comment`, 
        { text: newComment[postId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts(posts.map(p => 
        p._id === postId 
          ? { ...p, comments: response.data.comments }
          : p
      ));

      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      console.error('Erreur commentaire:', error);
      alert('❌ Erreur lors de l\'ajout du commentaire');
    }
  };

  // Supprimer un post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Supprimer ce post ?')) return;

    try {
      await axios.delete(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(posts.filter(p => p._id !== postId));
      alert('✅ Post supprimé');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  // Voter sur un sondage
  const handleVotePoll = async (postId, optionIndex) => {
    if (!token) {
      alert('Vous devez être connecté pour voter');
      return;
    }

    try {
      const response = await axios.post(`/api/posts/${postId}/poll/vote`, 
        { optionIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mettre à jour le post avec les résultats du sondage immédiatement (comme les likes)
      if (response.data && response.data.poll) {
        setPosts(posts.map(p => 
          p._id === postId 
            ? { 
                ...p, 
                poll: {
                  ...response.data.poll,
                  options: Array.isArray(response.data.poll.options) ? response.data.poll.options : []
                }
              }
            : p
        ));
      }
    } catch (error) {
      console.error('Erreur vote:', error);
      alert(error.response?.data?.message || '❌ Erreur lors du vote');
    }
  };

  // Gestion des options de sondage
  const addPollOption = () => {
    setPollData({ ...pollData, options: [...pollData.options, ''] });
  };

  const removePollOption = (index) => {
    if (pollData.options.length <= 2) {
      alert('Un sondage doit avoir au moins 2 options');
      return;
    }
    const newOptions = pollData.options.filter((_, i) => i !== index);
    setPollData({ ...pollData, options: newOptions });
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollData.options];
    newOptions[index] = value;
    setPollData({ ...pollData, options: newOptions });
  };

  // Modifier un post
  const handleEditPost = (post) => {
    setEditingPost(post._id);
    setEditPostData({
      text: post.text,
      linkUrl: post.link?.url || '',
      linkText: post.link?.text || '',
      videoUrl: post.videoUrl || ''
    });
  };

  const handleUpdatePost = async (postId) => {
    try {
      const response = await axios.patch(`/api/posts/${postId}`, editPostData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(posts.map(p => p._id === postId ? response.data.post : p));
      setEditingPost(null);
      alert('✅ Post modifié avec succès');
    } catch (error) {
      console.error('Erreur modification post:', error);
      alert('❌ Erreur lors de la modification');
    }
  };

  // Supprimer un commentaire
  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;

    try {
      const response = await axios.delete(`/api/posts/${postId}/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(posts.map(p => 
        p._id === postId 
          ? { ...p, comments: response.data.comments }
          : p
      ));
      alert('✅ Commentaire supprimé');
    } catch (error) {
      console.error('Erreur suppression commentaire:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  // Modifier un commentaire
  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditCommentText(comment.text);
  };

  const handleUpdateComment = async (postId, commentId) => {
    try {
      const response = await axios.patch(`/api/posts/${postId}/comment/${commentId}`, 
        { text: editCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts(posts.map(p => 
        p._id === postId 
          ? { ...p, comments: response.data.comments }
          : p
      ));
      setEditingComment(null);
      alert('✅ Commentaire modifié');
    } catch (error) {
      console.error('Erreur modification commentaire:', error);
      alert('❌ Erreur lors de la modification');
    }
  };

  // Toggle commentaires
  const toggleComments = (postId) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  // Charger la vidéo embed au clic sur la miniature
  const handlePlayVideo = (event) => {
    const wrapper = event.currentTarget.closest('.post-video-embed');
    const thumbnail = wrapper.querySelector('.video-thumbnail-wrapper');
    const iframe = wrapper.querySelector('iframe');
    
    if (thumbnail && iframe) {
      thumbnail.style.display = 'none';
      iframe.style.display = 'block';
      
      // Ajouter autoplay à l'URL si YouTube
      const currentSrc = iframe.src;
      if (currentSrc.includes('youtube.com') && !currentSrc.includes('autoplay=1')) {
        iframe.src = currentSrc.replace('autoplay=0', 'autoplay=1');
      }
    }
  };

  const formatDate = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="newsletter-container">
      {/* Header */}
      <div className="newsletter-header">
        <h1>
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '10px'}}>
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          GJ NEWS
        </h1>
        <p>Partagez vos moments, photos, vidéos et actualités</p>
      </div>

      {/* Créer un post */}
      {user && (
        <div className="create-post-section">
          {!showPostForm ? (
            <button className="btn-create-post" onClick={() => setShowPostForm(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Créer une publication
            </button>
          ) : (
            <div className="post-form">
              <div className="post-form-header">
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  Nouvelle publication
                </h3>
                <button className="btn-close" onClick={() => setShowPostForm(false)}>×</button>
              </div>

              <textarea
                className="post-textarea"
                placeholder={`Quoi de neuf, ${user.firstName} ?`}
                value={newPost.text}
                onChange={(e) => setNewPost({ ...newPost, text: e.target.value })}
                rows={4}
              />

              {/* Bouton Emoji */}
              <div className="emoji-picker-container">
                <button 
                  type="button"
                  className="btn-emoji"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  😊 Ajouter des emojis
                </button>
                {showEmojiPicker && (
                  <div className="emoji-picker-wrapper">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
              </div>

              {/* Upload de fichiers */}
              <div className="media-upload-section">
                <h4>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '6px'}}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Ajouter des médias
                </h4>
                
                {/* Image */}
                <div className="upload-item">
                  <label className="upload-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '6px'}}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image')}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {previewUrls.image && (
                    <div className="preview-container">
                      <img src={previewUrls.image} alt="Aperçu" className="preview-image" />
                      <button className="btn-remove-file" onClick={() => removeFile('image')}>×</button>
                    </div>
                  )}
                </div>

                {/* Vidéo */}
                <div className="upload-item">
                  <label className="upload-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '6px'}}>
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                    Vidéo
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'video')}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {previewUrls.video && (
                    <div className="preview-container">
                      <video src={previewUrls.video} controls className="preview-video" preload="metadata" />
                      <button className="btn-remove-file" onClick={() => removeFile('video')}>×</button>
                    </div>
                  )}
                </div>

                {/* Document */}
                <div className="upload-item">
                  <label className="upload-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '6px'}}>
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    Document (PDF, Word, etc.)
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.xlsx"
                      onChange={(e) => handleFileChange(e, 'document')}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {selectedFiles.document && (
                    <div className="file-info">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '4px'}}>
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                          <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                        {selectedFiles.document.name}
                      </span>
                      <button className="btn-remove-file" onClick={() => removeFile('document')}>×</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lien externe */}
              <div className="link-section">
                <h4>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '6px'}}>
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  Ajouter un lien
                </h4>
                <input
                  type="text"
                  placeholder="URL du lien"
                  value={newPost.linkUrl}
                  onChange={(e) => setNewPost({ ...newPost, linkUrl: e.target.value })}
                  className="link-input"
                />
                <input
                  type="text"
                  placeholder="Texte du lien (optionnel)"
                  value={newPost.linkText}
                  onChange={(e) => setNewPost({ ...newPost, linkText: e.target.value })}
                  className="link-input"
                />
              </div>

              {/* Lien vidéo (YouTube, Vimeo, etc.) */}
              <div className="link-section">
                <h4>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '6px'}}>
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Lien vidéo (YouTube, Vimeo...)
                </h4>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newPost.videoUrl}
                  onChange={(e) => setNewPost({ ...newPost, videoUrl: e.target.value })}
                  className="link-input"
                />
                {newPost.videoUrl && (
                  <p style={{fontSize: '0.85rem', color: '#6c757d', marginTop: '0.5rem'}}>
                    💡 Compatible avec YouTube, Vimeo, Dailymotion
                  </p>
                )}
              </div>

              {/* Sondage */}
              <div className="poll-section">
                <button 
                  type="button"
                  className="btn-toggle-poll"
                  onClick={() => setShowPollForm(!showPollForm)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '6px'}}>
                    <line x1="12" y1="20" x2="12" y2="10"></line>
                    <line x1="18" y1="20" x2="18" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="16"></line>
                  </svg>
                  {showPollForm ? 'Retirer le sondage' : 'Ajouter un sondage'}
                </button>

                {showPollForm && (
                  <div className="poll-form">
                    <input
                      type="text"
                      placeholder="Question du sondage"
                      value={pollData.question}
                      onChange={(e) => setPollData({ ...pollData, question: e.target.value })}
                      className="poll-question-input"
                    />

                    <div className="poll-options-list">
                      {pollData.options && Array.isArray(pollData.options) && pollData.options.map((option, index) => (
                        <div key={index} className="poll-option-item">
                          <input
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updatePollOption(index, e.target.value)}
                            className="poll-option-input"
                          />
                          {pollData.options.length > 2 && (
                            <button
                              type="button"
                              className="btn-remove-option"
                              onClick={() => removePollOption(index)}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="btn-add-option"
                      onClick={addPollOption}
                    >
                      ➕ Ajouter une option
                    </button>

                    <div className="poll-settings">
                      <label>
                        <input
                          type="radio"
                          name="pollType"
                          value="single"
                          checked={pollData.pollType === 'single'}
                          onChange={(e) => setPollData({ ...pollData, pollType: e.target.value })}
                        />
                        Choix unique
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="pollType"
                          value="multiple"
                          checked={pollData.pollType === 'multiple'}
                          onChange={(e) => setPollData({ ...pollData, pollType: e.target.value })}
                        />
                        Choix multiples
                      </label>
                    </div>

                    <div className="poll-end-date">
                      <label>
                        Date de fin (optionnel)
                        <input
                          type="datetime-local"
                          value={pollData.endsAt}
                          onChange={(e) => setPollData({ ...pollData, endsAt: e.target.value })}
                          className="poll-date-input"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <button className="btn-publish" onClick={handleCreatePost}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Publier
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fil de posts avec infinite scroll */}
      <div className="posts-feed">
        {posts && Array.isArray(posts) && posts.map((post, index) => {
          const isLastPost = posts.length === index + 1;
          
          return (
            <div 
              key={post._id} 
              className="post-card"
              ref={isLastPost ? lastPostRef : null}
            >
              {/* En-tête du post */}
              <div className="post-header">
                <div className="post-author">
                  <div className="author-avatar">
                    {post.author?.profilePhoto ? (
                      <img src={post.author.profilePhoto} alt={post.author.firstName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {post.author ? `${post.author.firstName[0]}${post.author.lastName[0]}` : '?'}
                      </div>
                    )}
                  </div>
                  <div className="author-info">
                    <div className="author-name">
                      {post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Utilisateur inconnu'}
                    </div>
                    <div className="post-date">{formatDate(post.createdAt)}</div>
                  </div>
                </div>
                {user && (
                  (user.role === 'responsable' || user.role === 'admin') || 
                  (post.author && post.author._id === user._id)
                ) && (
                  <div className="post-actions-menu">
                    {(
                      (post.author && post.author._id === user._id) || 
                      user.role === 'responsable' || 
                      user.role === 'admin'
                    ) && (
                      <button className="btn-edit-post" onClick={() => handleEditPost(post)} title="Modifier">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    )}
                    {(user.role === 'responsable' || user.role === 'admin') && (
                      <button className="btn-delete-post" onClick={() => handleDeletePost(post._id)} title="Supprimer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Contenu ou formulaire d'édition */}
              {editingPost === post._id ? (
                <div className="post-edit-form">
                  <textarea
                    value={editPostData.text}
                    onChange={(e) => setEditPostData({ ...editPostData, text: e.target.value })}
                    placeholder="Modifier le texte du post..."
                    rows="4"
                  />
                  <button 
                    type="button"
                    className="btn-emoji-small"
                    onClick={() => setShowEditPostEmojiPicker(!showEditPostEmojiPicker)}
                    style={{ marginBottom: '0.5rem' }}
                  >
                    😊 Emoji
                  </button>
                  {showEditPostEmojiPicker && (
                    <div className="emoji-picker-wrapper" style={{ marginBottom: '1rem' }}>
                      <EmojiPicker onEmojiClick={handleEditPostEmojiClick} />
                    </div>
                  )}
                  <input
                    type="url"
                    value={editPostData.videoUrl}
                    onChange={(e) => setEditPostData({ ...editPostData, videoUrl: e.target.value })}
                    placeholder="URL vidéo (YouTube, Vimeo...)"
                  />
                  <input
                    type="url"
                    value={editPostData.linkUrl}
                    onChange={(e) => setEditPostData({ ...editPostData, linkUrl: e.target.value })}
                    placeholder="URL du lien"
                  />
                  <input
                    type="text"
                    value={editPostData.linkText}
                    onChange={(e) => setEditPostData({ ...editPostData, linkText: e.target.value })}
                    placeholder="Texte du lien"
                  />
                  <div className="edit-actions">
                    <button className="btn-save" onClick={() => handleUpdatePost(post._id)}>💾 Enregistrer</button>
                    <button className="btn-cancel" onClick={() => setEditingPost(null)}>❌ Annuler</button>
                  </div>
                </div>
              ) : (
                <div className="post-content">
                  <p className="post-text">{post.text}</p>

                {/* Image */}
                {post.image && (
                  <div className="post-image">
                    <img src={post.image} alt="Post" />
                  </div>
                )}

                {/* Vidéo uploadée localement */}
                {post.video && (
                  <div className="post-video">
                    <video 
                      src={post.video} 
                      controls 
                      preload="metadata" 
                      poster={post.video + '#t=0.5'}
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                  </div>
                )}

                {/* Vidéo via lien (YouTube, Vimeo, etc.) */}
                {post.videoUrl && (() => {
                  let embedUrl = '';
                  let thumbnailUrl = '';
                  const url = post.videoUrl;
                  
                  // YouTube
                  if (url.includes('youtube.com') || url.includes('youtu.be')) {
                    const videoId = url.includes('youtu.be') 
                      ? url.split('youtu.be/')[1]?.split('?')[0]
                      : url.split('v=')[1]?.split('&')[0];
                    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0`;
                    thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                  }
                  // Vimeo
                  else if (url.includes('vimeo.com')) {
                    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                    embedUrl = `https://player.vimeo.com/video/${videoId}`;
                    // Vimeo thumbnails nécessitent l'API, on utilisera l'iframe directement
                    thumbnailUrl = null;
                  }
                  // Dailymotion
                  else if (url.includes('dailymotion.com')) {
                    const videoId = url.split('video/')[1]?.split('?')[0];
                    embedUrl = `https://www.dailymotion.com/embed/video/${videoId}`;
                    thumbnailUrl = `https://www.dailymotion.com/thumbnail/video/${videoId}`;
                  }

                  return embedUrl ? (
                    <div className="post-video-embed" data-video-url={embedUrl}>
                      {thumbnailUrl && (
                        <div className="video-thumbnail-wrapper" onClick={handlePlayVideo}>
                          <img src={thumbnailUrl} alt="Aperçu vidéo" className="video-thumbnail" />
                          <div className="play-button-overlay">
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="white" stroke="none">
                              <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.7)"/>
                              <polygon points="10,8 16,12 10,16" fill="white"/>
                            </svg>
                          </div>
                        </div>
                      )}
                      <iframe
                        src={embedUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Vidéo"
                        loading="lazy"
                        style={thumbnailUrl ? {display: 'none'} : {}}
                      ></iframe>
                    </div>
                  ) : (
                    <a href={post.videoUrl} target="_blank" rel="noopener noreferrer" className="post-link">
                      <div className="link-card">
                        <div className="link-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                        <div className="link-text">Voir la vidéo</div>
                      </div>
                    </a>
                  );
                })()}

                {/* Document */}
                {post.document && (
                  <a href={post.document} target="_blank" rel="noopener noreferrer" className="post-document">
                    <div className="document-card">
                      <span className="document-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                          <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                      </span>
                      <span className="document-name">Télécharger le document</span>
                    </div>
                  </a>
                )}

                {/* Lien */}
                {post.link && (
                  <a href={post.link.url} target="_blank" rel="noopener noreferrer" className="post-link">
                    <div className="link-card">
                      <div className="link-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                      </div>
                      <div className="link-text">{post.link.text || post.link.url}</div>
                    </div>
                  </a>
                )}

                {/* Sondage */}
                {post.poll && post.poll.question && (
                  <div className="post-poll">
                    <h4 className="poll-question">📊 {post.poll.question}</h4>
                    <div className="poll-options">
                      {post.poll.options && Array.isArray(post.poll.options) && post.poll.options.map((option, index) => {
                        const pollOptions = post.poll.options || [];
                        const totalVotes = pollOptions.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
                        const votes = option.votes?.length || 0;
                        const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
                        const hasVoted = option.votes?.some(v => v.user === user?._id);

                        return (
                          <div 
                            key={index} 
                            className={`poll-option ${hasVoted ? 'voted' : ''}`}
                            onClick={() => post.poll.isActive && handleVotePoll(post._id, index)}
                          >
                            <div className="poll-option-bar" style={{ width: `${percentage}%` }}></div>
                            <div className="poll-option-content">
                              <span className="poll-option-text">{option.text}</span>
                              <span className="poll-option-stats">
                                {votes} vote{votes !== 1 ? 's' : ''} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="poll-footer">
                      <span className="poll-total">
                        {post.poll.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0)} vote(s) au total
                      </span>
                      {post.poll.endsAt && (
                        <span className="poll-ends">
                          Se termine le {new Date(post.poll.endsAt).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {!post.poll.isActive && (
                        <span className="poll-closed">🔒 Sondage fermé</span>
                      )}
                    </div>
                  </div>
                )}
                </div>
              )}

              {/* Actions */}
              <div className="post-footer">
                <button 
                  className={`btn-action ${post.isLikedByUser ? 'liked' : ''}`}
                  onClick={() => handleLike(post._id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={post.isLikedByUser ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '4px'}}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  {post.likes?.length || 0}
                </button>
                <button 
                  className="btn-action"
                  onClick={() => toggleComments(post._id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '4px'}}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {post.comments?.length || 0}
                </button>
                <button className="btn-action">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '4px'}}>
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  Partager
                </button>
              </div>

              {/* Section commentaires */}
              {showComments[post._id] && (
                <div className="comments-section">
                  {/* Liste des commentaires */}
                  <div className="comments-list">
                    {post.comments && Array.isArray(post.comments) && post.comments.length > 0 ? (
                      post.comments.map(comment => (
                        <div key={comment._id} className="comment-item">
                          <div className="comment-avatar">
                            {comment.author.profilePhoto ? (
                              <img src={comment.author.profilePhoto} alt="" />
                            ) : (
                              <div className="avatar-small">
                                {comment.author.firstName[0]}
                              </div>
                            )}
                          </div>
                          <div className="comment-content">
                            <div className="comment-header">
                              <span className="comment-author">
                                {comment.author.firstName} {comment.author.lastName}
                              </span>
                              <span className="comment-date">
                                {formatDate(comment.createdAt)}
                              </span>
                              {user && (comment.author._id === user._id || user.role === 'responsable' || user.role === 'admin') && (
                                <div className="comment-actions">
                                  <button 
                                    className="btn-edit-comment" 
                                    onClick={() => handleEditComment(comment)}
                                    title="Modifier"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    className="btn-delete-comment" 
                                    onClick={() => handleDeleteComment(post._id, comment._id)}
                                    title="Supprimer"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </div>
                            {editingComment === comment._id ? (
                              <div className="comment-edit-form">
                                <textarea
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                  rows="2"
                                />
                                <button 
                                  type="button"
                                  className="btn-emoji-small"
                                  onClick={() => setShowEditCommentEmojiPicker(!showEditCommentEmojiPicker)}
                                  style={{ marginTop: '0.5rem' }}
                                >
                                  😊 Emoji
                                </button>
                                {showEditCommentEmojiPicker && (
                                  <div className="emoji-picker-wrapper" style={{ marginTop: '0.5rem' }}>
                                    <EmojiPicker onEmojiClick={handleEditCommentEmojiClick} />
                                  </div>
                                )}
                                <div className="comment-edit-actions">
                                  <button onClick={() => handleUpdateComment(post._id, comment._id)}>💾 Enregistrer</button>
                                  <button onClick={() => setEditingComment(null)}>❌ Annuler</button>
                                </div>
                              </div>
                            ) : (
                              <p className="comment-text">{comment.text}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-comments">Aucun commentaire pour le moment</p>
                    )}
                  </div>

                  {/* Ajouter un commentaire */}
                  {user && (
                    <div className="add-comment">
                      <input
                        type="text"
                        placeholder="Écrire un commentaire..."
                        value={newComment[post._id] || ''}
                        onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post._id);
                          }
                        }}
                        className="comment-input"
                      />
                      <button 
                        type="button"
                        className="btn-emoji-small"
                        onClick={() => setShowCommentEmojiPicker({ ...showCommentEmojiPicker, [post._id]: !showCommentEmojiPicker[post._id] })}
                      >
                        😊
                      </button>
                      {showCommentEmojiPicker[post._id] && (
                        <div className="emoji-picker-wrapper emoji-picker-comment">
                          <EmojiPicker onEmojiClick={(emojiData) => handleCommentEmojiClick(post._id, emojiData)} />
                        </div>
                      )}
                      <button 
                        className="btn-send-comment"
                        onClick={() => handleAddComment(post._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '4px'}}>
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                        Envoyer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Chargement...</p>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="end-message">
            <p>🎉 Vous avez tout vu !</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsletterPage;
