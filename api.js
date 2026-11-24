const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export async function api(path, options = {}) {
  const token = localStorage.getItem('eduspace_token');
  const body = options.body;
  const isFormData = body instanceof FormData;
  let response;
  try {
    response = await fetch(`${BASE}${path}`, { ...options, headers: {
      ...(!isFormData && body != null ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {})
    }, body: isFormData || body == null ? body : JSON.stringify(body) });
  } catch { throw Error('Không thể kết nối máy chủ. Kiểm tra backend đang chạy tại cổng 5000.'); }
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    if (response.status === 401 && !['/auth/login', '/auth/register'].includes(path)) {
      localStorage.removeItem('eduspace_token'); window.dispatchEvent(new Event('auth-expired'));
    }
    throw Error(data?.message || 'Có lỗi xảy ra');
  }
  return data;
}
export async function download(path, fileName, inline = false) {
  const token = localStorage.getItem('eduspace_token');
  // Mở tab ngay trong sự kiện click để trình duyệt không chặn popup sau khi fetch xong.
  const previewWindow = inline ? window.open('', '_blank') : null;
  try {
    const r = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw Error((await r.json().catch(() => ({}))).message || 'Không tải được tệp');
    const blob = await r.blob(); const objectURL = URL.createObjectURL(blob);
    if (inline) {
      if (!previewWindow) throw Error('Trình duyệt đã chặn cửa sổ xem PDF; hãy cho phép popup.');
      previewWindow.location.href = objectURL;
    } else {
      const a = document.createElement('a'); a.href = objectURL; a.download = fileName || 'document'; a.click();
    }
    setTimeout(() => URL.revokeObjectURL(objectURL), 60000);
  } catch(error) { previewWindow?.close(); throw error; }
}
export const dateText = date => date ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date)) : 'Không giới hạn';
