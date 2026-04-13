'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactPreferences {
  id: string;
  therapist_id: string;
  allow_phone: boolean;
  allow_email: boolean;
  allow_whatsapp: boolean;
  auto_reply_message: string | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'http://placeholder.supabase.invalid',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key'
);

export default function ContactPreferencesPage() {
  const [preferences, setPreferences] = useState<ContactPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    allow_phone: true,
    allow_email: true,
    allow_whatsapp: false,
    auto_reply_message: '',
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage({ type: 'error', text: 'Please log in to manage preferences' });
        return;
      }

      // Get therapist ID
      const { data: therapist } = await supabase
        .from('therapists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!therapist) {
        setMessage({ type: 'error', text: 'Therapist profile not found' });
        return;
      }

      // Get preferences
      const { data: prefs, error } = await supabase
        .from('contact_preferences')
        .select('*')
        .eq('therapist_id', therapist.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (prefs) {
        setPreferences(prefs);
        setFormData({
          allow_phone: prefs.allow_phone,
          allow_email: prefs.allow_email,
          allow_whatsapp: prefs.allow_whatsapp,
          auto_reply_message: prefs.auto_reply_message || '',
        });
      } else {
        // Create default preferences
        const { data: newPrefs } = await supabase
          .from('contact_preferences')
          .insert([
            {
              therapist_id: therapist.id,
              allow_phone: true,
              allow_email: true,
              allow_whatsapp: false,
            },
          ])
          .select()
          .single();

        if (newPrefs) {
          setPreferences(newPrefs);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load preferences',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!preferences) return;

    try {
      setSaving(true);
      setMessage(null);

      const { error } = await supabase
        .from('contact_preferences')
        .update({
          allow_phone: formData.allow_phone,
          allow_email: formData.allow_email,
          allow_whatsapp: formData.allow_whatsapp,
          auto_reply_message: formData.auto_reply_message || null,
        })
        .eq('id', preferences.id);

      if (error) throw error;

      setPreferences({
        ...preferences,
        ...formData,
      });

      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save preferences',
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Contact Preferences</h1>
          <p className="text-muted-foreground">
            Control how clients can contact you
          </p>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Contact Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Methods</CardTitle>
            <CardDescription>
              Choose which contact methods clients can use to reach you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_email}
                    onChange={(e) =>
                      setFormData({ ...formData, allow_email: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="font-medium">Email</span>
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Allow clients to contact you via email
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, allow_phone: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="font-medium">Phone</span>
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Allow clients to call or text your phone number
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, allow_whatsapp: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="font-medium">WhatsApp</span>
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Allow clients to message you on WhatsApp
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Reply Message */}
        <Card>
          <CardHeader>
            <CardTitle>Auto-Reply Message (Optional)</CardTitle>
            <CardDescription>
              Send a message to clients when they contact you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.auto_reply_message}
              onChange={(e) =>
                setFormData({ ...formData, auto_reply_message: e.target.value })
              }
              placeholder="Thanks for reaching out! I'll get back to you within 24 hours."
              maxLength={500}
              className="w-full min-h-32 p-3 border rounded text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {formData.auto_reply_message.length}/500 characters
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>

        {/* Help Text */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-sm mb-2">How this works</h3>
            <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
              <li>Clients see your available contact methods on your profile</li>
              <li>Inquiries are logged in your contact dashboard</li>
              <li>You decide how to respond to each inquiry</li>
              <li>Direct contact methods link directly to your email/phone</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
