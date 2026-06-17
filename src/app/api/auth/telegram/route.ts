import { NextRequest, NextResponse } from "next/server";
import * as crypto from "crypto";
import { getServiceSupabase } from "@/lib/supabase";

function verifyTelegramData(initData: string): Record<string, string> | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) return null;

  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.TELEGRAM_BOT_TOKEN!)
    .digest();

  const expectedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (expectedHash !== hash) return null;

  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();

    if (!initData) {
      return NextResponse.json(
        { error: "Missing initData" },
        { status: 400 }
      );
    }

    const verified = verifyTelegramData(initData);

    if (!verified || !verified.user) {
      return NextResponse.json(
        { error: "Invalid Telegram data" },
        { status: 401 }
      );
    }

    const tgUser = JSON.parse(verified.user);
    const telegramId = String(tgUser.id);

    const email = `tg_${telegramId}@telegram.user`;

    // Must be the same password every login
    const password = crypto
      .createHash("sha256")
      .update(`${telegramId}:${process.env.TELEGRAM_BOT_TOKEN}`)
      .digest("hex")
      .slice(0, 32);

    const admin = getServiceSupabase();

    const tgMetadata = {
      telegram_id: telegramId,
      first_name: tgUser.first_name || "",
      last_name: tgUser.last_name || "",
      username: tgUser.username || "",
      photo_url: tgUser.photo_url || "",
    };

    // 1. Try login first
    const { data: loginData, error: loginError } =
      await admin.auth.signInWithPassword({
        email,
        password,
      });

    if (!loginError && loginData.session) {
      // Keep metadata (name, photo, username) fresh on every login, since
      // Telegram users can change these and we only set them at creation
      // otherwise.
      const { data: updateData } = await admin.auth.admin.updateUserById(
        loginData.user.id,
        { user_metadata: tgMetadata }
      );

      return NextResponse.json({
        user: updateData?.user ?? loginData.user,
        session: loginData.session,
      });
    }

    // 2. If login failed, create user
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: tgMetadata,
    });

    // Ignore duplicate user error
    if (
      createError &&
      !createError.message.toLowerCase().includes("already been registered")
    ) {
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    // 3. Login again after create
    const { data: finalLoginData, error: finalLoginError } =
      await admin.auth.signInWithPassword({
        email,
        password,
      });

    if (finalLoginError || !finalLoginData.session) {
      return NextResponse.json(
        {
          error: finalLoginError?.message || "Login failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: finalLoginData.user,
      session: finalLoginData.session,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}