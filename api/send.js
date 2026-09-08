export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const {
      name,
      phone,
      email,
      city,
      district,
      service,
      propertyType,
      description
    } = req.body || {};

    if (!name || !phone || !city || !district || !service || !propertyType) {
      return res.status(400).json({
        ok: false,
        error: 'البيانات الأساسية غير مكتملة'
      });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'إنشاءات الزياد <onboarding@resend.dev>',
        to: ['S_alhedary@yahoo.com'],
        subject: `طلب خدمة جديد - ${name}`,
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.8">
            <h2>طلب خدمة جديد | إنشاءات الزياد</h2>
            <p><strong>الاسم:</strong> ${name}</p>
            <p><strong>الجوال:</strong> ${phone}</p>
            <p><strong>البريد:</strong> ${email || 'غير مذكور'}</p>
            <p><strong>المدينة:</strong> ${city}</p>
            <p><strong>الحي:</strong> ${district}</p>
            <p><strong>الخدمة:</strong> ${service}</p>
            <p><strong>نوع المبنى:</strong> ${propertyType}</p>
            <p><strong>الوصف:</strong> ${description || 'غير مذكور'}</p>
          </div>
        `
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(result);
      return res.status(500).json({
        ok: false,
        error: 'تعذر إرسال البريد'
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      error: 'حدث خطأ أثناء إرسال الطلب'
    });
  }
}
