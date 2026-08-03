import { createContext, useContext } from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  coins: number;
}

export interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

export const UserContext = createContext<UserContextType>(
  {} as UserContextType
);

export const useUser = () => useContext(UserContext);
