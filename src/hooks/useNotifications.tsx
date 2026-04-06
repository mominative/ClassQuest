import { createContext, useContext, useState, ReactNode } from "react";

export interface AppNotification {
  id: string;
  message: string;
  time: Date;
  read: boolean;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  addNotification: (message: string) => void;
  markAllRead: () => void;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  addNotification: () => {},
  markAllRead: () => {},
  unreadCount: 0,
});

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = (message: string) => {
    setNotifications((prev) =>
      [{ id: Date.now().toString(), message, time: new Date(), read: false }, ...prev].slice(0, 15)
    );
  };

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, markAllRead, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
