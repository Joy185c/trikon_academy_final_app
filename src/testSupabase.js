// import { supabase } from "./lib/supabaseclient";
import { supabase } from "./lib/supabaseclient.js";


async function testConnection() {
  const { data, error } = await supabase.from("admins").select("*").limit(1);

  if (error) {
    console.error("❌ Supabase Error:", error.message);
  } else {
    console.log("✅ Supabase Connected! Data:", data);
  }
}

testConnection();
