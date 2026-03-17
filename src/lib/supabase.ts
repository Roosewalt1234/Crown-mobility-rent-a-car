import { createClient } from '@supabase/supabase-js';

const getEnvVar = (name: string) => {
  // Check process.env (Node.js/Railway)
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  // Check import.meta.env (Vite/Client)
  try {
    // @ts-ignore - Vite specific
    if (import.meta.env && import.meta.env[name]) {
      // @ts-ignore
      return import.meta.env[name];
    }
  } catch (e) {
    // Ignore errors in environments where import.meta.env is not defined
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith('http');
  } catch {
    return false;
  }
};

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
  console.warn('Supabase credentials missing or invalid. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(
  isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
