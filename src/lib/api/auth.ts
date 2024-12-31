import { supabase } from '../supabaseClient';

export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/schedules`
    }
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}


/*
Check session code
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);
*/
