import React, { createContext, useCallback, useState, useContext } from 'react';

import api from '../services/api';

interface AuthState {
  token: string;
  userWithoutPassword: object;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  userWithoutPassword: object;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@GoBarber:token');
    const userWithoutPassword = localStorage.getItem(
      '@GoBarber:userWithoutPassword',
    );

    if (token && userWithoutPassword) {
      return { token, userWithoutPassword: JSON.parse(userWithoutPassword) };
    }

    return {} as AuthState;
  });

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, userWithoutPassword } = response.data;

    localStorage.setItem('@GoBarber:token', token);
    localStorage.setItem(
      '@GoBarber:userWithoutPassword',
      JSON.stringify(userWithoutPassword),
    );

    setData({ token, userWithoutPassword });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@GoBarber:token');
    localStorage.removeItem('@GoBarber:userWithoutPassword');

    setData({} as AuthState);
  }, []);

  return (
    <AuthContext.Provider
      value={{ userWithoutPassword: data.userWithoutPassword, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
