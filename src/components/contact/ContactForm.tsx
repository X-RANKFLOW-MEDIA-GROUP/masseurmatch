'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactFormProps {
  therapistId: string;
  therapistName: string;
  therapistEmail: string;
  allowedMethods: {
    phone: boolean;
    email: boolean;
    whatsapp: boolean;
  };
}

export function ContactForm({
  therapistId,
  therapistName,
  therapistEmail,
  allowedMethods,
}: ContactFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    message: '',
    preferredContact: 'email' as const,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.clientName.trim()) throw new Error('Please enter your name');
      if (!formData.clientEmail.trim()) throw new Error('Please enter a valid email');
      if (!formData.message.trim()) throw new Error('Please write a message');

      // Validate preferred contact method is allowed
      if (
        formData.preferredContact === 'phone' && !allowedMethods.phone ||
        formData.preferredContact === 'email' && !allowedMethods.email ||
        formData.preferredContact === 'whatsapp' && !allowedMethods.whatsapp
      ) {
        throw new Error('Your preferred contact method is not available for this therapist');
      }

      // Call API
      const response = await fetch('/api/contact/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId,
          clientName: formData.clientName.trim(),
          clientEmail: formData.clientEmail.trim(),
          clientPhone: formData.clientPhone.trim() || null,
          message: formData.message.trim(),
          preferredContact: formData.preferredContact,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send message');
      }

      setSuccess(true);
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        message: '',
        preferredContact: 'email',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Get in touch with {therapistName}</CardTitle>
        <CardDescription>
          Send a message and they&apos;ll get back to you soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                Message sent successfully! {therapistName} will respond soon.
              </AlertDescription>
            </Alert>
          )}

          {/* Name */}
          <div>
            <label htmlFor="clientName" className="text-sm font-medium">
              Your name
            </label>
            <Input
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="John Smith"
              disabled={loading}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="clientEmail" className="text-sm font-medium">
              Your email
            </label>
            <Input
              id="clientEmail"
              name="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={handleChange}
              placeholder="john@example.com"
              disabled={loading}
              required
            />
          </div>

          {/* Phone (optional) */}
          {allowedMethods.phone && (
            <div>
              <label htmlFor="clientPhone" className="text-sm font-medium">
                Your phone (optional)
              </label>
              <Input
                id="clientPhone"
                name="clientPhone"
                type="tel"
                value={formData.clientPhone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                disabled={loading}
              />
            </div>
          )}

          {/* Preferred Contact Method */}
          <div>
            <label htmlFor="preferredContact" className="text-sm font-medium">
              How should they contact you?
            </label>
            <select
              id="preferredContact"
              name="preferredContact"
              value={formData.preferredContact}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              {allowedMethods.email && <option value="email">Email</option>}
              {allowedMethods.phone && <option value="phone">Phone</option>}
              {allowedMethods.whatsapp && <option value="whatsapp">WhatsApp</option>}
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="text-sm font-medium">
              Your message
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell them about your needs, availability, or any questions..."
              rows={5}
              disabled={loading}
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send message'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By sending this message, you agree to MasseurMatch&apos;s terms of service.
            {therapistName} will receive your contact information and message.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
