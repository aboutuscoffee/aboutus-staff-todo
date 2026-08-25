import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function subscribeToPush(staffKey) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('このブラウザはプッシュ通知に対応していません');
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('通知の許可が得られませんでした');

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const json = subscription.toJSON();
  const { error } = await supabase
    .from('staff_todo_push_subscriptions')
    .upsert(
      { staff_key: staffKey, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
      { onConflict: 'endpoint' }
    );
  if (error) throw new Error(error.message);
  return subscription;
}

export async function sendPush(staffKey, title, body) {
  const { data, error } = await supabase.functions.invoke('staff-todo-send-push', {
    body: { staff_key: staffKey, title, body },
  });
  if (error) throw new Error(error.message);
  return data;
}
