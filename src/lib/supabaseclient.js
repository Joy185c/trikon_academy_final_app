// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Environment variable থেকে পড়া হবে
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
