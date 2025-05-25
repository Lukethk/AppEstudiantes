import React, { createContext, useContext, useState } from 'react';

export interface User {
  nombre: string;
  correo: string;
  token: string;
}

interface SessionContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession debe ser usado dentro de un SessionProvider');
  }
  return context;
}; 