import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// import { supabase } from 'shared/utils/supabaseClient';
import { supabase } from 'config/supabaseClient';
import toast from 'shared/utils/toast';
import { getStoredAuthToken, storeAuthToken } from 'shared/utils/authToken';
import { PageLoader } from 'shared/components';

const Authenticate = () => {
  const history = useHistory();

  useEffect(() => {
    const authenticateUser = async () => {
      console.log(process.env.SUPABASE_KEY);
      try {
        // Check if already logged in
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          storeAuthToken(session.access_token);
          history.push('/');
          return;
        }

        // Dummy user credentials
        const guestEmail = 'guest@example.com';
        const password = '12345678';

        // Try login first
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: guestEmail,
          password,
        });

        // If login fails, try sign-up
        if (loginError) {
          const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: guestEmail,
            password,
          });

          if (signupError) throw signupError;

          const authuser = signupData.user;
          const { error: insertionerror } = await supabase.from('users').insert({
            name: authuser.email.substring(0, authuser.email.indexOf('@')),
            email: authuser.email,
            createdAt: authuser.created_at,
            updatedAt: authuser.updated_at,
          });

          if (insertionerror) {
            console.log('Error in inserting in users', insertionerror);
          }

          storeAuthToken(signupData.session.access_token);
        } else {
          storeAuthToken(loginData.session.access_token);
        }
        history.push('/');
      } catch (error) {
        toast.error(error.message || 'Authentication failed');
      }
    };

    if (!getStoredAuthToken()) {
      authenticateUser();
    } else {
      history.push('/');
    }
  }, [history]);

  return <PageLoader />;
};

export default Authenticate;
