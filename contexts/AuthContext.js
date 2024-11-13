// AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

const getUserFromSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error fetching user session:", error);
      return null;
    }

    if (session?.user) {
      // Ensure user object has consistent format
      return {
        id: session.user.id.toString(),
        email: session.user.email,
        // Add other necessary user fields
      };
    }

    return null;
  } catch (error) {
    console.error("Unexpected error in getUserFromSession:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const currentUser = await getUserFromSession();
        console.log("Fetched session user:", currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error("Error in fetchUser:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (session?.user) {
          const formattedUser = {
            id: session.user.id.toString(),
            email: session.user.email,
            // Add other necessary user fields
          };
          setUser(formattedUser);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const setAuth = (authUser) => {
    if (authUser) {
      setUser({
        id: authUser.id.toString(),
        email: authUser.email,
        // Add other necessary user fields
      });
    } else {
      setUser(null);
    }
  };

  const setUserData = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
      id: (userData.id || prevUser.id).toString(), // Ensure ID remains a string
    }));
  };

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
