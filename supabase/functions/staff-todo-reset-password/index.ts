import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ ok: false, error: "認証情報がありません" }, 401);
  }

  // 呼び出し元のJWTを検証して本人を特定する。config.tomlのverify_jwt=trueにより
  // 無効なJWTはこの関数に到達する前にSupabase側で弾かれるが、
  // ここでも改めてuserを取得し、実際に誰が呼んでいるかをGM/オーナー判定に使う
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await callerClient.auth.getUser();
  if (userError || !user) {
    return jsonResponse({ ok: false, error: "認証に失敗しました" }, 401);
  }

  let body: { staffKey?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const { staffKey, newPassword } = body;
  if (!staffKey || !newPassword) {
    return jsonResponse({ ok: false, error: "staffKeyとnewPasswordが必要です" }, 400);
  }

  // ここから先はstaff/rolesをRLSに関係なく確認する必要があるためservice_roleを使う。
  // このキーはこの関数の中だけで使い、ブラウザには一切渡さない
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 呼び出し元が本当にGM/オーナーかをサーバー側で再判定する。
  // フロント側のisAdmin表示制御はここでは信用せず、必ずここで確認する
  const { data: callerStaff, error: callerStaffError } = await adminClient
    .from("staff")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (callerStaffError || !callerStaff) {
    return jsonResponse({ ok: false, error: "呼び出し元スタッフを特定できませんでした" }, 403);
  }

  const { data: callerRole, error: callerRoleError } = await adminClient
    .from("roles")
    .select("key, is_owner")
    .eq("key", callerStaff.role)
    .maybeSingle();
  const isAdmin = !callerRoleError && !!callerRole && (callerRole.key === "GM" || callerRole.is_owner === true);
  if (!isAdmin) {
    return jsonResponse({ ok: false, error: "管理者権限がありません" }, 403);
  }

  // 対象スタッフのauth_user_idを取得
  const { data: targetStaff, error: targetStaffError } = await adminClient
    .from("staff")
    .select("auth_user_id")
    .eq("key", staffKey)
    .maybeSingle();
  if (targetStaffError || !targetStaff) {
    return jsonResponse({ ok: false, error: "対象スタッフが見つかりません" }, 404);
  }
  if (!targetStaff.auth_user_id) {
    return jsonResponse(
      { ok: false, error: "このスタッフはSupabase Authアカウントが未設定のため、パスワードを変更できません" },
      400,
    );
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(targetStaff.auth_user_id, {
    password: newPassword,
  });
  if (updateError) {
    return jsonResponse({ ok: false, error: updateError.message }, 500);
  }

  return jsonResponse({ ok: true });
});
