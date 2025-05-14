import { useState, useEffect } from 'react';
import { supabase } from 'config/supabaseClient';

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.log('Error fetching session', error);
        return;
      }
      const user = session?.user;
      setCurrentUser(user);
      setCurrentUserId(user?.id);
    };

    fetchSession();
  }, []);

  return { currentUser, currentUserId };
};

export default useCurrentUser;
