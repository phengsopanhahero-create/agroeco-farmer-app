"use client";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

function getTelegramUserSync(): TelegramUser | null {
  if (typeof window === "undefined") return null;
  try {
    const user = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    return user ?? null;
  } catch {
    return null;
  }
}

export function useTelegramUser() {
  const [tgUser, setTgUser] = useState<TelegramUser | null>(() =>
    getTelegramUserSync()
  );

  useEffect(() => {
    WebApp.ready();
    const user = WebApp.initDataUnsafe?.user;
    if (user) setTgUser(user as TelegramUser);
  }, []);

  return tgUser;
}
