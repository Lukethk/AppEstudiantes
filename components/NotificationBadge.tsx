import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LocalNotificationStorage from '../services/LocalNotificationStorage';

interface NotificationBadgeProps {
  size?: number;
  color?: string;
  textColor?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = 16,
  color = '#e53935',
  textColor = '#fff',
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const localStorage = LocalNotificationStorage.getInstance();

  useEffect(() => {
    loadUnreadCount();
    
    // Recargar cada 30 segundos
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await localStorage.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error al cargar contador de notificaciones no leídas:', error);
      setUnreadCount(0);
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <View style={[styles.badge, { width: size, height: size, backgroundColor: color }]}>
      <Text style={[styles.badgeText, { color: textColor, fontSize: size * 0.6 }]}>
        {unreadCount > 99 ? '99+' : unreadCount.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 16,
    minHeight: 16,
  },
  badgeText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 