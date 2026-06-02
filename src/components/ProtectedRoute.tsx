"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
}

const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/confirm"];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && user === null && !publicRoutes.includes(pathname)) {
      router.push("/auth/login");
    }
  }, [user, loading, pathname, router]);

  if (loading || (user === null && !publicRoutes.includes(pathname))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
