import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.alerts);
      setUnreadCount(res.data.unreadCount);
    } catch {}
  }, [user]);

  const fetchUnreadMessages = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/messages/unread-count');
      setUnreadMessages(res.data.count);
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchAlerts();
    fetchUnreadMessages();
    const interval = setInterval(() => {
      fetchAlerts();
      fetchUnreadMessages();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts, fetchUnreadMessages]);

  const markRead = async (id) => {
    await api.patch(`/alerts/${id}/read`);
    fetchAlerts();
  };

  const markAllRead = async () => {
    await api.patch('/alerts/read-all');
    fetchAlerts();
  };

  return (
    <AlertContext.Provider value={{
      alerts, unreadCount, unreadMessages,
      fetchAlerts, fetchUnreadMessages,
      markRead, markAllRead,
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);
