import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      logout();
    }
  }, [token, logout]);

  // Charger le profil au démarrage
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  const signup = async (firstName, lastName, email, password, churchWebsite) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/signup', {
        firstName,
        lastName,
        email,
        password,
        churchWebsite,
      });
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      // Gérer les erreurs de validation
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        return { success: false, error: errorMessages };
      }
      return { success: false, error: error.response?.data?.message || 'Une erreur est survenue' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: newUser } = response.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      // Gérer les erreurs de validation
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        return { success: false, error: errorMessages };
      }
      return { success: false, error: error.response?.data?.message || 'Une erreur est survenue' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await axios.put(
        '/api/auth/profile',
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    await fetchUser(); 
  };

  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.post('/api/auth/check-email', { email });
      return response.data;
    } catch (error) {
      return { available: false, message: 'Erreur lors de la vérification' };
    }
  };

  const updateUserActivities = (selectedActivities) => {
    setUser(prevUser => ({
      ...prevUser,
      selectedActivities
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signup,
        login,
        logout,
        updateProfile,
        refreshUser,
        checkEmailAvailability,
        updateUserActivities,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
