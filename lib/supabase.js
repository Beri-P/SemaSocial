// lib/supabase.js
import { AppState } from "react-native";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "../constants";

console.log("Creating Supabase client with URL:", supabaseUrl);

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Verify client was created successfully
if (!supabaseClient?.auth) {
  console.error("Failed to initialize Supabase client properly");
}

AppState.addEventListener("change", (state) => {
  if (supabaseClient?.auth) {
    supabaseClient.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          if (state === "active") {
            supabaseClient.auth.startAutoRefresh();
          } else {
            supabaseClient.auth.stopAutoRefresh();
          }
        }
      })
      .catch((error) => {
        console.error("Error getting session:", error);
      });
  }
});

// Export as both default and named export
export { supabaseClient as supabase };
export default supabaseClient;
