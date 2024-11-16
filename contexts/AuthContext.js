//AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

const AuthContext = createContext();

const getUserProfile = async (userId) => {
  if (!userId) {
    console.error("getUserProfile: No userId provided");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const setUserData = (newData) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...newData,
    }));
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const profile = await getUserProfile(session.user.id);
          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              ...session.user.user_metadata,
              ...profile,
            });
          } else {
            console.error("No profile found for user:", session.user.id);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        try {
          const profile = await getUserProfile(session.user.id);
          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              ...session.user.user_metadata,
              ...profile,
            });
            router.replace("/tabs/home");
          } else {
            console.error("No profile found for user:", session.user.id);
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error("Error updating user state:", error);
          await supabase.auth.signOut();
        }
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        setUser(null);
        router.replace("/welcome");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (userData) => {
    if (!userData?.id) {
      throw new Error("No user data provided");
    }

    try {
      const profile = await getUserProfile(userData.id);
      if (profile) {
        setUser({
          id: userData.id,
          email: userData.email,
          ...userData.user_metadata,
          ...profile,
        });
      } else {
        throw new Error("No profile found for user");
      }
    } catch (error) {
      console.error("Error setting user:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      // First set user to null to prevent any profile-related errors
      setUser(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Navigation will be handled by the auth state change listener
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Auth state:", { user, isLoading });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
        setUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
