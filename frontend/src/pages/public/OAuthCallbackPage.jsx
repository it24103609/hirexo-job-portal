import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../../components/ui/Loader';
import { setSession } from '../../services/storage';

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return JSON.parse(atob(padded));
}

function getDashboardPath(role) {
  if (role === 'employer') {
    return '/employer/dashboard';
  }

  if (role === 'admin') {
    return '/admin/dashboard';
  }

  return '/candidate/dashboard';
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      console.log('HASH:', window.location.hash);

      const params = new URLSearchParams(
        window.location.hash.replace(/^#/, '')
      );

      const sessionValue = params.get('session');

      console.log('SESSION VALUE:', sessionValue);

      if (!sessionValue) {
        throw new Error('Missing OAuth session.');
      }

      const session = decodeBase64Url(sessionValue);

      console.log('DECODED SESSION:', session);

      setSession({
        token: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user
      });

      console.log(
        'TOKEN AFTER SAVE:',
        localStorage.getItem('HEXORA_access_token')
      );

      toast.success('Logged in successfully');

      setTimeout(() => {
        navigate(
          getDashboardPath(session.user?.role),
          { replace: true }
        );
      }, 500);

    } catch (err) {
      console.error('OAuth Error:', err);

      toast.error(
        'OAuth login could not be completed. Please try again.'
      );

      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  return <Loader label="Completing sign in..." />;
}