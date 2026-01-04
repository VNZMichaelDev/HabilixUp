import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const KEY = 'admin_authed';

export const useAdminAuth = () => {
  const [authorized, setAuthorized] = useState(() => sessionStorage.getItem(KEY) === '1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async pwd => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'admin_password')
      .single();

    if (err) {
      setError('Error de servidor');
      setLoading(false);
      return false;
    }
    if (data && String(data.value) === pwd) {
      sessionStorage.setItem(KEY, '1');
      setAuthorized(true);
      setLoading(false);
      return true;
    }
    setError('Contraseña incorrecta');
    setLoading(false);
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(KEY);
    setAuthorized(false);
  };

  return { authorized, loading, error, login, logout };
};
