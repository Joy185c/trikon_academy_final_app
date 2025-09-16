import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseclient.js";

function AdminBkashSettings() {
  const [bkashNumber, setBkashNumber] = useState("");
  const [loading, setLoading] = useState(true);

  // fetch current bkash number
  useEffect(() => {
    const fetchBkashNumber = async () => {
      let { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "bkash_number")
        .single();

      if (data) setBkashNumber(data.value);
      setLoading(false);
    };

    fetchBkashNumber();
  }, []);

  // update bkash number
  const handleSave = async () => {
    if (!bkashNumber) {
      alert("Enter a valid bKash number!");
      return;
    }

    // check if already exists
    let { data } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "bkash_number")
      .single();

    if (data) {
      // update
      const { error } = await supabase
        .from("settings")
        .update({ value: bkashNumber })
        .eq("key", "bkash_number");

      if (!error) alert("✅ Updated successfully!");
    } else {
      // insert new
      const { error } = await supabase
        .from("settings")
        .insert([{ key: "bkash_number", value: bkashNumber }]);

      if (!error) alert("✅ Added successfully!");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading Settings...</p>;

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white shadow-xl rounded-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-purple-600 mb-4 text-center">
        ⚙️ Payment Settings
      </h2>
      <p className="text-gray-600 text-sm mb-6 text-center">
        Update your bKash number for receiving course payments
      </p>

      <label className="block text-gray-700 font-medium mb-2">
        bKash Personal Number
      </label>
      <input
        type="text"
        value={bkashNumber}
        onChange={(e) => setBkashNumber(e.target.value)}
        placeholder="Enter bKash Number"
        className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg outline-none focus:border-purple-400"
      />

      <button
        onClick={handleSave}
        className="mt-6 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:opacity-90"
      >
        💾 Save Settings
      </button>
    </div>
  );
}

export default AdminBkashSettings;
