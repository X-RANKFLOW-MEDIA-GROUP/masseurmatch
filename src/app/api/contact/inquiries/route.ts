import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseAdminClient } from '@/app/api/_lib/supabase-server';
import { requireRequestSession, type RequestSession } from '@/app/_lib/session';

// GET /api/contact/inquiries — fetch inquiries for the authenticated therapist
export async function GET(request: NextRequest) {
  try {
    const session: RequestSession = await requireRequestSession(request as unknown as Request);
    const supabase = createSupabaseAdminClient();

    const { searchParams } = new URL(request.url);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.userId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ ok: false, error: profileError.message }, { status: 500 });
    }
    if (!profile) {
      return NextResponse.json({ ok: true, inquiries: [], total: 0 });
    }

    const { count } = await supabase
      .from('contact_inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profile.id);

    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, inquiries: data ?? [], total: count ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = (err as { status?: number }).status ?? 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

// PATCH /api/contact/inquiries?id=xxx — update inquiry status
export async function PATCH(request: NextRequest) {
  try {
    const session: RequestSession = await requireRequestSession(request as unknown as Request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });

    const body = await request.json() as { status: string };
    if (!body.status) return NextResponse.json({ ok: false, error: 'status required' }, { status: 400 });

    const supabase = createSupabaseAdminClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', session.userId)
      .maybeSingle();

    if (!profile) return NextResponse.json({ ok: false, error: 'Profile not found' }, { status: 404 });

    const { error } = await supabase
      .from('contact_inquiries')
      .update({ status: body.status })
      .eq('id', id)
      .eq('profile_id', profile.id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = (err as { status?: number }).status ?? 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      therapistId,
      clientName,
      clientEmail,
      clientPhone,
      message,
      preferredContact,
    } = body;

    if (!therapistId || !clientName || !clientEmail || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, full_name, email_address, email')
      .eq('id', therapistId)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ message: profileError.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ message: 'Therapist not found' }, { status: 404 });
    }

    const { data: prefs } = await supabase
      .from('contact_preferences')
      .select('allow_phone, allow_email, allow_whatsapp, auto_reply_message')
      .eq('therapist_id', profile.id)
      .maybeSingle();

    if (prefs) {
      if (preferredContact === 'phone' && !prefs.allow_phone) {
        return NextResponse.json(
          { message: 'Phone contact is not available for this therapist' },
          { status: 400 }
        );
      }
      if (preferredContact === 'email' && !prefs.allow_email) {
        return NextResponse.json(
          { message: 'Email contact is not available for this therapist' },
          { status: 400 }
        );
      }
      if (preferredContact === 'whatsapp' && !prefs.allow_whatsapp) {
        return NextResponse.json(
          { message: 'WhatsApp contact is not available for this therapist' },
          { status: 400 }
        );
      }
    }

    const { data: inquiry, error: insertError } = await supabase
      .from('contact_inquiries')
      .insert([
        {
          profile_id: profile.id,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone || null,
          message,
          preferred_contact: preferredContact ?? 'email',
          status: 'new',
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { message: 'Failed to send inquiry' },
        { status: 500 }
      );
    }

    const therapistEmail = profile.email_address || profile.email;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (therapistEmail && resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://masseurmatch.com';
        const therapistName = escapeHtml(profile.display_name || profile.full_name || 'Therapist');
        const safeClientName = escapeHtml(clientName);
        const safeClientEmail = escapeHtml(clientEmail);
        const safeMessage = escapeHtml(message);
        const safePhone = clientPhone ? escapeHtml(clientPhone) : null;
        const inquiryLink = `${appUrl}/pro/inquiries`;

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'MasseurMatch <notifications@masseurmatch.com>',
          to: therapistEmail,
          subject: `New inquiry from ${safeClientName}`,
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
            body{font-family:sans-serif;color:#333}
            .container{max-width:600px;margin:0 auto;padding:20px}
            .header{background:linear-gradient(135deg,#8B1E2D 0%,#A5243A 100%);color:white;padding:20px;border-radius:8px 8px 0 0}
            .content{border:1px solid #ddd;border-radius:0 0 8px 8px;padding:20px}
            .info-block{background:#F0F0F0;padding:15px;border-radius:6px;margin:15px 0}
            .button{background:#8B1E2D;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:15px}
            .footer{font-size:12px;color:#999;margin-top:20px;border-top:1px solid #ddd;padding-top:20px}
          </style></head><body>
          <div class="container">
            <div class="header"><h1>New Client Inquiry</h1><p>You have a new message from ${safeClientName}</p></div>
            <div class="content">
              <p>Hi ${therapistName},</p>
              <p>A new client has reached out to you on MasseurMatch:</p>
              <div class="info-block">
                <p><strong>From:</strong> ${safeClientName}</p>
                <p><strong>Email:</strong> <a href="mailto:${safeClientEmail}">${safeClientEmail}</a></p>
                ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
                <p><strong>Preferred contact:</strong> ${escapeHtml(preferredContact || 'email')}</p>
              </div>
              <p><strong>Message:</strong></p>
              <div class="info-block"><p>${safeMessage.replace(/\n/g, '<br>')}</p></div>
              <a href="${inquiryLink}" class="button">View in Dashboard</a>
              <div class="footer"><p>This is an automated notification. Do not reply to this email.</p></div>
            </div>
          </div></body></html>`,
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
      }
    }

    return NextResponse.json(
      { message: 'Inquiry sent successfully', inquiryId: inquiry.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact inquiry error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
