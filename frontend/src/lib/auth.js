import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function normalizeUsername(name = '') {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

export function usernameToEmail(name = '') {
  const username = normalizeUsername(name);
  return username ? `${username}@vitaltec.local` : '';
}

export async function signInWithName(name, password) {
  if (!supabase) throw new Error('Supabase não configurado.');
  const email = usernameToEmail(name);
  if (!email) throw new Error('Informe um nome válido.');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutSession() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function bootstrapAdmin(name, password) {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase não configurado.');
  const email = usernameToEmail(name);
  if (!email) throw new Error('Informe um nome válido.');

  const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: `bootstrap-${Date.now()}`,
    },
  });

  const { data, error } = await tempClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
        username: normalizeUsername(name),
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function createUserByAdmin(name, password) {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('Supabase não configurado.');
  const email = usernameToEmail(name);
  if (!email) throw new Error('Informe um nome válido.');

  const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: `create-user-${Date.now()}`,
    },
  });

  const { data, error } = await tempClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
        username: normalizeUsername(name),
      },
    },
  });

  if (error) throw error;
  return { ...data, generated_login: normalizeUsername(name) };
}
