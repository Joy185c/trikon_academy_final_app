// supabase/functions/add-admin/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase client setup
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!, // আপনার Supabase Project URL
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // Service role key
);

serve(async (req) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }

    // Insert admin into table
    const { data, error } = await supabase
      .from("admins")
      .insert([{ email, role: "admin" }]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ message: "Admin added", data }), {
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
