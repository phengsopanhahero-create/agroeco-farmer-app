// app/auth/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { t, lang, setLang } = useTranslations();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initData) {
      setIsTelegram(true);
    }
  }, []);

  // Auto-login when inside Telegram Mini App
  useEffect(() => {
    if (!isMounted || !isTelegram) return;
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.initData) return;

    setLoading(true);
    fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg.initData }),
    })
      .then((r) => r.json())
      .then(async ({ session, error: err }) => {
        if (err || !session) {
          setError(err || "Telegram login failed");
          setLoading(false);
          return;
        }
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        router.push("/");
      })
      .catch(() => {
        setError("Telegram login failed");
        setLoading(false);
      });
  }, [isMounted, isTelegram]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setError(
          error.message ||
            (lang === "kh"
              ? "កំហុសក្នុងការចូលប្រើប្រាស់"
              : "Login error occurred")
        );
        return;
      }

      if (data.user) {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(
        error.message ||
          (lang === "kh"
            ? "កំហុសក្នុងការចូលប្រើប្រាស់"
            : "Login error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  // Show spinner while: not yet mounted, auth session is loading, inside Telegram (auto-login), or already logged in
  if (!isMounted || authLoading || isTelegram || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <button
        onClick={() => setLang(lang === "kh" ? "en" : "kh")}
        className="absolute top-4 right-4 text-sm text-gray-600 underline"
      >
        {lang === "kh" ? "EN" : "ខ្មែរ"}
      </button>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t("login")}</CardTitle>
          <p className="text-gray-600">
            {lang === "kh"
              ? "ចូលប្រើប្រាស់គណនីរបស់អ្នក"
              : "Sign in to your account"}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                disabled={loading}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading
                ? lang === "kh"
                  ? "កំពុងចូលប្រើប្រាស់..."
                  : "Signing in..."
                : t("login")}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/signup"
                className="text-sm text-green-600 hover:underline"
              >
                {t("switchToSignup")}
              </Link>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-gray-600 hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
