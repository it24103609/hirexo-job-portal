const TOKEN_KEY = 'hirexo_access_token';
const REFRESH_KEY = 'hirexo_refresh_token';
const USER_KEY = 'hirexo_user';

export function setSession({ token, refreshToken, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  const user = localStorage.getItem(USER_KEY);

  return {
    token,
    refreshToken,
    user: user ? JSON.parse(user) : null
  };
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}
