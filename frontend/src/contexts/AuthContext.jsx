import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { authApi } from '../services/auth.api';
import { setSession, clearSession, getSession } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, profile: null, token: null, loading: true });

  const syncUser = async () => {
    const session = getSession();

    try {
      if (!session?.token) {
        setState({ user: null, profile: null, token: null, loading: false });
        return;
      }

      const { data } = await authApi.me();
      setState({ user: data.user, profile: data.profile, token: session.token, loading: false });
    } catch {
      if (!session?.refreshToken) {
        clearSession();
        setState({ user: null, profile: null, token: null, loading: false });
        return;
      }

      try {
        const refreshed = await authApi.refreshToken({ refreshToken: session.refreshToken });
        setSession({
          token: refreshed.data.accessToken,
          refreshToken: refreshed.data.refreshToken || session.refreshToken,
          user: session.user
        });

        const { data } = await authApi.me();
        setState({
          user: data.user,
          profile: data.profile,
          token: refreshed.data.accessToken,
          loading: false
        });
      } catch {
        clearSession();
        setState({ user: null, profile: null, token: null, loading: false });
      }
    }
  };

  useEffect(() => {
    syncUser();
  }, []);

  const value = useMemo(() => ({
    ...state,
    isAuthenticated: Boolean(state.user),
    login: async (payload) => {
      const response = await authApi.login(payload);
      setSession({ token: response.data.accessToken, refreshToken: response.data.refreshToken, user: response.data.user });
      setState({ user: response.data.user, profile: response.data.profile, token: response.data.accessToken, loading: false });
      toast.success('Logged in successfully');
      return response.data.user;
    },
    registerCandidate: async (payload) => {
      const response = await authApi.registerCandidate(payload);
      setSession({ token: response.data.accessToken, refreshToken: response.data.refreshToken, user: response.data.user });
      setState({ user: response.data.user, profile: null, token: response.data.accessToken, loading: false });
      toast.success('Candidate account created');
      return response.data.user;
    },
    registerEmployer: async (payload) => {
      const response = await authApi.registerEmployer(payload);
      setSession({ token: response.data.accessToken, refreshToken: response.data.refreshToken, user: response.data.user });
      setState({ user: response.data.user, profile: null, token: response.data.accessToken, loading: false });
      toast.success('Employer account created');
      return response.data.user;
    },
    logout: () => {
      clearSession();
      setState({ user: null, profile: null, token: null, loading: false });
      toast.info('Logged out');
    },
    refreshUser: syncUser
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
