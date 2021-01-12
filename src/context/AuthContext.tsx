import React, { createContext, useCallback, useState } from 'react';

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

  return (
    <AuthContext.Provider
      value={{ userWithoutPassword: data.userWithoutPassword, signIn }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
