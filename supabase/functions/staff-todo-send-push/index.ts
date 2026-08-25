import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

const VAPID_PUBLIC_KEY = Deno.env.get("STAFF_TODO_VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("STAFF_TODO_VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("STAFF_TODO_VAPID_SUBJECT")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { staff_key, title, body } = await req.json().catch(() => ({}));
  if (!staff_key) {
    return new Response(JSON.stringify({ error: "staff_key is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: subs, error } = await supabase
    .from("staff_todo_push_subscriptions")
    .select("*")
    .eq("staff_key", staff_key);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // task_offered は承認するまでバッジを減らさないので、未読カウントからは除外し
  // 代わりに未承認のタスク依頼件数を加算する
  const [{ count: unreadOther }, { count: pendingOffers }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("staff_key", staff_key)
      .eq("read", false)
      .neq("type", "task_offered"),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("staff_key", staff_key)
      .eq("pending_approval", true),
  ]);
  const badge = (unreadOther ?? 0) + (pendingOffers ?? 0);

  const payload = JSON.stringify({ title: title || "通知", body: body || "", badge });
  const results = await Promise.allSettled(
    (subs ?? []).map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      )
    )
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const details = results.map((r) =>
    r.status === "fulfilled"
      ? { ok: true }
      : { ok: false, error: String(r.reason?.body || r.reason?.message || r.reason) }
  );

  return new Response(
    JSON.stringify({ attempted: results.length, succeeded, details }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
