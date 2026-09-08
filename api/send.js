export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const city = String(body.city || '').trim();
    const district = String(body.district || '').trim();
    const property = String(body.property_type || body.propertyType || '').trim();
    const requestedServices = String(body.services || body.service || '').trim();
    const description = String(body.description || '').trim();

    if (!name || !phone || !city || !district || !property || !requestedServices) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields'
      });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: 'RESEND_API_KEY is not configured'
      });
    }

    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const html = `
      <div dir="rtl" style="font-family:Arial,Tahoma,sans-serif;line-height:1.9">
        <h2>طلب خدمة جديد | إنشاءات الزياد</h2>
        <p><strong>الاسم:</strong> ${escapeHtml(name)}</p>
        <p><strong>رقم الجوال:</strong> ${escapeHtml(phone)}</p>
        <p><strong>البريد الإلكتروني:</strong> ${escapeHtml(email || 'غير مذكور')}</p>
        <p><strong>المدينة:</strong> ${escapeHtml(city)}</p>
        <p><strong>الحي:</strong> ${escapeHtml(district)}</p>
        <p><strong>نوع المبنى:</strong> ${escapeHtml(property)}</p>
        <p><strong>الخدمات المطلوبة:</strong> ${escapeHtml(requestedServices)}</p>
        <p><strong>الوصف:</strong> ${escapeHtml(description || 'لا يوجد')}</p>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'إنشاءات الزياد <onboarding@resend.dev>',
        to: ['s_alhedary@yahoo.com'],
        subject: `طلب خدمة جديد - ${name}`,
        html
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: data
      });
    }

    return res.status(200).json({
      ok: true,
      id: data.id || null
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
}
