// hooks/useAuthGuard.js
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from 'config/supabaseClient';
import { getStoredAuthToken } from 'shared/utils/authToken';

export const useAuthGuard = () => {
  const history = useHistory();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredAuthToken();

      if (!token) {
        // fallback: check session from supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          history.replace('/authenticate');
        }
      }
    };

    checkAuth();
  }, [history]);
};
