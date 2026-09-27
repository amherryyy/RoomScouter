import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "../../../src/lib/supabase/server";

function getSafeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const flowId = request.nextUrl.searchParams.get("sb_flow_id");
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );

    if (!error) {
      const destination = request.nextUrl.clone();
      destination.pathname = nextPath;
      destination.search = "";
      return NextResponse.redirect(destination);
    }
  }

  const failure = request.nextUrl.clone();
  failure.pathname = "/login";
  failure.search = "";
  failure.searchParams.set("error", "The confirmation link is invalid or has expired.");
  return NextResponse.redirect(failure);
}
