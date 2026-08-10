import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createSupabaseWebhookAdminClient } from '@/app/api/_lib/supabase-server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.UNSUBSCRIBE_JWT_SECRET || process.env.JWT_SECRET || 'unsubscribe-secret-key'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'No unsubscribe token provided.' },
        { status: 400 }
      );
    }

    let userId: string;
    let email: string;

    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      const payload = verified.payload as Record<string, unknown>;
      userId = payload.sub || payload.user_id;
      email = payload.email || '';

      if (!userId || typeof userId !== 'string') {
        return NextResponse.json(
          { error: 'Invalid or expired unsubscribe link.' },
          { status: 401 }
        );
      }
    } catch (err) {
      console.error('[Unsubscribe] JWT verification error:', err);
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe link.' },
        { status: 401 }
      );
    }

    const adminClient = createSupabaseWebhookAdminClient();

    try {
      const { data: existing, error: fetchError } = await adminClient
        .from('marketing_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('[Unsubscribe] Database fetch error:', fetchError);
        return NextResponse.json(
          { error: 'Failed to retrieve email preferences.' },
          { status: 500 }
        );
      }

      if (existing) {
        // Update existing preferences
        const { error: updateError } = await adminClient
          .from('marketing_preferences')
          .update({
            marketing_opt_in: false,
            newsletter_opt_in: false,
            updated_at: new Date().toISOString(),
            updated_by: 'unsubscribe-link',
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('[Unsubscribe] Database update error:', updateError);
          return NextResponse.json(
            { error: 'Failed to update preferences.' },
            { status: 500 }
          );
        }
      } else {
        // Create new preferences record
        const { error: insertError } = await adminClient
          .from('marketing_preferences')
          .insert({
            user_id: userId,
            marketing_opt_in: false,
            newsletter_opt_in: false,
            updated_by: 'unsubscribe-link',
          });

        if (insertError) {
          console.error('[Unsubscribe] Database insert error:', insertError);
          return NextResponse.json(
            { error: 'Failed to update preferences.' },
            { status: 500 }
          );
        }
      }

      // Get the user's email from auth if not in token
      let userEmail = email;
      if (!userEmail) {
        try {
          const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId);
          if (!authError && authUser.user?.email) {
            userEmail = authUser.user.email;
          }
        } catch (err) {
          console.error('[Unsubscribe] Failed to fetch user email:', err);
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Successfully unsubscribed from marketing emails.',
          email: userEmail,
        },
        { status: 200 }
      );
    } catch (err) {
      console.error('[Unsubscribe] Unexpected error:', err);
      return NextResponse.json(
        { error: 'An unexpected error occurred.' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('[Unsubscribe] Request parsing error:', err);
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }
}
