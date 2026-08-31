import { supabase } from './supabase';

// 管理者(GM/オーナー)による他スタッフのパスワードリセット。実際の権限確認・
// Supabase Authパスワード更新はEdge Function(staff-todo-reset-password)側で行う
export async function resetStaffPassword(staffKey, newPassword) {
  const { data, error } = await supabase.functions.invoke('staff-todo-reset-password', {
    body: { staffKey, newPassword },
  });
  if (error) {
    let message = error.message || 'パスワードの変更に失敗しました';
    if (error.context && typeof error.context.json === 'function') {
      try {
        const body = await error.context.json();
        if (body?.error) message = body.error;
      } catch {
        // レスポンスボディがJSONでない場合はerror.messageのまま使う
      }
    }
    return { ok: false, message };
  }
  if (data?.ok === false) {
    return { ok: false, message: data.error || 'パスワードの変更に失敗しました' };
  }
  return { ok: true };
}
