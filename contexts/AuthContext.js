// AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

const getUserFromSession = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching user session:", error);
    return null;
  }

  return session?.user || null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getUserFromSession();
      console.log("Fetched session user:", currentUser); // Log user data after fetching session
      setUser(currentUser);
    };

    fetchUser();

    // Listen to authentication state changes (for log in, log out)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user); // Update user if a session exists
        } else {
          setUser(null); // Reset user if session is invalid
        }
      }
    );

    // Unsubscribe properly using authListener.subscription
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const setAuth = (authUser) => {
    setUser(authUser);
  };

  const setUserData = (userData) => {
    setUser((prevUser) => ({ ...prevUser, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
