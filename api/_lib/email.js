const FROM_NAME = 'AgroServ'

export function emailConfigured() {
  return Boolean(process.env.GMAIL_WEBHOOK_URL && process.env.GMAIL_WEBHOOK_SECRET)
}

export async function sendEmail({ to, subject, text, html, fromName = FROM_NAME }) {
  if (!emailConfigured()) return { sent: false, reason: 'not-configured' }

  try {
    const response = await fetch(process.env.GMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.GMAIL_WEBHOOK_SECRET,
        to,
        subject,
        text: text || '',
        html: html || '',
        fromName,
      }),
      signal: AbortSignal.timeout(12000),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || data.ok !== true) {
      return { sent: false, reason: data.error || `HTTP ${response.status}` }
    }
    return { sent: true }
  } catch (error) {
    return { sent: false, reason: error.message || 'send failed' }
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function passwordResetEmail({ name, url, appName = 'AgroServ' }) {
  const safeName = escapeHtml(name || 'foydalanuvchi')
  const safeUrl = escapeHtml(url)
  const safeApp = escapeHtml(appName)
  const text = [
    `Salom, ${name || 'foydalanuvchi'}!`,
    '',
    `${appName} hisobingiz parolini tiklash uchun quyidagi havolani oching:`,
    url,
    '',
    "Havola 30 daqiqa amal qiladi va faqat bir marta ishlatiladi.",
    "Agar bu so'rovni siz yubormagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.",
    '',
    `${appName} jamoasi`,
  ].join('\n')

  const html = `<!doctype html>
<html lang="uz">
  <body style="margin:0;padding:0;background:#f5f5f0;font-family:Arial,Helvetica,sans-serif;color:#1c2b22;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border:1px solid #e7e5e4;border-radius:18px;padding:28px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#059669;">${safeApp}</p>
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#052e16;">Parolni tiklash</h1>
        <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#44403c;">Salom, <strong>${safeName}</strong>!</p>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#44403c;">
          Hisobingiz parolini tiklash uchun quyidagi tugmani bosing. Havola <strong>30 daqiqa</strong> amal qiladi.
        </p>
        <p style="margin:0 0 22px;">
          <a href="${safeUrl}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 22px;border-radius:10px;">Yangi parol o'rnatish</a>
        </p>
        <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#78716c;">Tugma ishlamasa, havolani nusxalab brauzerga qo'ying:</p>
        <p style="margin:0 0 20px;font-size:11px;line-height:1.5;color:#059669;word-break:break-all;">${safeUrl}</p>
        <p style="margin:0;padding-top:16px;border-top:1px solid #e7e5e4;font-size:11px;line-height:1.6;color:#a8a29e;">
          Agar bu so'rovni siz yubormagan bo'lsangiz, bu xatni e'tiborsiz qoldiring. Parolingiz o'zgarmaydi.
        </p>
      </div>
      <p style="margin:16px 0 0;text-align:center;font-size:10px;color:#a8a29e;">${safeApp} · Agro xizmatlar platformasi</p>
    </div>
  </body>
</html>`

  return { text, html }
}
