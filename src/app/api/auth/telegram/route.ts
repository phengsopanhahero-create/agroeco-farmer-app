import { NextRequest, NextResponse } from "next/server";
import { verifyTelegramWebAppData } from "@/lib/telegram-auth";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json({ error: "Missing initData" }, { status: 400 });
    }

    const verified = verifyTelegramWebAppData(initData);
    if (!verified) {
      return NextResponse.json({ error: "Invalid Telegram data" }, { status: 401 });
    }

    const admin = getAdminClient();
    const { user: tgUser } = verified;
    const email = `tg_${tgUser.id}@telegram.local`;
    const password = `tg_${tgUser.id}_${process.env.TELEGRAM_BOT_TOKEN?.slice(-8)}`;

    // Try to sign in first
    const { data: signInData, error: signInError } =
      await admin.auth.signInWithPassword({ email, password });

    if (!signInError && signInData.session) {
      return NextResponse.json({ session: signInData.session, user: tgUser });
    }

    // User doesn't exist — create them
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        telegram_id: tgUser.id,
        first_name: tgUser.first_name,
        last_name: tgUser.last_name,
        username: tgUser.username,
        photo_url: tgUser.photo_url,
      },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Sign in after creating
    const { data: afterCreateData, error: afterCreateError } =
      await admin.auth.signInWithPassword({ email, password });

    if (afterCreateError || !afterCreateData.session) {
      return NextResponse.json(
        { error: afterCreateError?.message || "Failed to create session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ session: afterCreateData.session, user: tgUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
