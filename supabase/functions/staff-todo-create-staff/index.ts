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

// 「既にこのメールアドレスで登録済み」を示すエラーかどうかを判定する。
// Admin APIのエラーメッセージ文言に依存するため、代表的なパターンをまとめて拾う
function isEmailAlreadyRegisteredError(message: string) {
  const m = message.toLowerCase();
  return m.includes("already been registered") || m.includes("already registered") || m.includes("email_exists");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ ok: false, error: "認証情報がありません" }, 401);
  }

  // 呼び出し元のJWTを検証して本人を特定する
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await callerClient.auth.getUser();
  if (userError || !user) {
    return jsonResponse({ ok: false, error: "認証に失敗しました" }, 401);
  }

  // リクエストボディはinitialPasswordを含むため、以後この変数以外に分割代入した値を
  // ログに出したり、そのまま丸ごとconsole.logしたりしないこと
  let body: {
    key?: string;
    name?: string;
    stores?: string[];
    role?: string;
    email?: string;
    initialPassword?: string;
    sortOrder?: number;
    hireDate?: string;
  };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const { key, name, stores, role, email, initialPassword, sortOrder, hireDate } = body;

  if (!name || !role) {
    return jsonResponse({ ok: false, error: "名前と役職は必須です" }, 400);
  }
  if (!email) {
    return jsonResponse({ ok: false, error: "メールアドレスを入力してください" }, 400);
  }
  if (!initialPassword) {
    return jsonResponse({ ok: false, error: "初期パスワードを入力してください" }, 400);
  }
  if (!key) {
    return jsonResponse({ ok: false, error: "内部エラー：スタッフキーがありません" }, 400);
  }

  // ここから先はstaff/rolesをRLSに関係なく確認・操作する必要があるためservice_roleを使う。
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

  // Supabase Authユーザーを先に作成する（同じメールが既に登録済みならここで失敗し、
  // staffレコードは一切作られない）
  const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
    email,
    password: initialPassword,
    email_confirm: true,
  });
  if (createUserError || !createdUser?.user) {
    const message = createUserError?.message || "Authユーザーの作成に失敗しました";
    if (isEmailAlreadyRegisteredError(message)) {
      return jsonResponse({ ok: false, error: "このメールアドレスは既に登録されています" }, 409);
    }
    console.error("staff-todo-create-staff: createUser failed", message);
    return jsonResponse({ ok: false, error: message }, 500);
  }

  const authUserId = createdUser.user.id;

  // staffレコードを作成する。実際の認証情報はSupabase Auth側(auth_user_id)にあるため、
  // 旧認証方式の列(password_hash/attempts/blocked)は指定しない
  const { data: insertedStaff, error: insertError } = await adminClient
    .from("staff")
    .insert({
      key,
      name,
      stores: stores ?? [],
      role,
      email,
      auth_user_id: authUserId,
      is_active: true,
      duties: [],
      sort_order: sortOrder ?? 0,
      hire_date: hireDate ?? null,
      position: "",
      strengths_html: "",
      notes_html: "",
      overall_eval_html: "",
    })
    .select()
    .single();

  if (insertError) {
    // staffの作成に失敗したので、孤立したAuthユーザーを残さないようロールバックを試みる
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(authUserId);
    if (deleteError) {
      console.error(
        "staff-todo-create-staff: rollback failed, orphaned auth user",
        authUserId,
        deleteError.message,
      );
      return jsonResponse(
        {
          ok: false,
          error:
            "Authアカウントは作成されましたが、スタッフ登録に失敗し、その後の削除にも失敗しました。手動での確認が必要です。",
        },
        500,
      );
    }
    console.error("staff-todo-create-staff: staff insert failed, rolled back auth user", insertError.message);
    return jsonResponse({ ok: false, error: "スタッフ情報の保存に失敗しました。もう一度お試しください" }, 500);
  }

  return jsonResponse({ ok: true, staff: insertedStaff });
});
