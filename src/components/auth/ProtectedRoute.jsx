import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";


const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    checkUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // loading state
  if (user === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // if not logged in → redirect
  if (!user) {
    return <Navigate to="/login" />;
  }

  // if logged in → show page
  return children;
};

export default ProtectedRoute;