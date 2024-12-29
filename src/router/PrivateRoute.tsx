// src/router/PrivateRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

/**
 * PrivateRoute checks if there's a current Supabase session.
 * If there's no user session, it redirects to /login.
 * If there is a user, it renders the nested <Outlet> (child routes).
 */
export default function PrivateRoute() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<null | any>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    // If there is no session, redirect to /login
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render child routes
  return <Outlet />;
}
