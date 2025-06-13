"use client";

import { useAuth } from "@/hooks/useAuth";
import Login from "@/components/Login";

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
