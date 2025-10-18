import { API_URL } from "../http";

export async function logToServer(
  level: 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, any> = {}
) {
  try {
    const res = await fetch(`${API_URL}log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        message,
        context,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      console.warn('❌ logToServer failed:', await res.text());
    }
  } catch (err) {
    console.warn('❌ Ошибка при отправке лога:', err);
  }
}