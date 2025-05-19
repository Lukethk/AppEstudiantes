import { createContext } from 'react';

export interface User {
  nombre: string;
  correo: string;
}

interface SessionContextType {
  user: User | null;
  login: (user: User) => void;
}

export const SessionContext = createContext<SessionContextType>({
  user: null,
  login: () => {},
}); 