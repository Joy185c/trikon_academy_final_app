// src/scripts/createAdmin.js
import { supabase } from "../lib/supabaseClient";

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: "joy209688@gmail.com",
    password: "Admin@12345",
  });

  if (error) {
    console.error("❌ Error creating admin:", error.message);
    return;
  }

  console.log("✅ Admin created:", data.user);

  // সাথে profiles এ role insert
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: data.user.id,
      role: "admin",
      secret_code: "540274tiptip",
    },
  ]);

  if (profileError) {
    console.error("❌ Error inserting profile:", profileError.message);
  } else {
    console.log("✅ Profile added successfully!");
  }
}

createAdmin();
