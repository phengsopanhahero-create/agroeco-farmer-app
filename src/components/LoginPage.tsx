"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, isTelegram } = useAuth();

  useEffect(() => {
    if (isTelegram || user) router.push("/");
  }, [isTelegram, user, router]);

  return (
    <div className="p-8 flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <p>Normal login form here...</p>
    </div>
  );
}
