// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://edmbobiqqgdzakbqxmnc.supabase.co"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkbWJvYmlxcWdkemFrYnF4bW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzcyNTQsImV4cCI6MjA3MjcxMzI1NH0.edmkXa309gM1g0j8fb3obucn9P0KAxXkTK6FrbiosbE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
